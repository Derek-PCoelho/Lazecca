// =============================================================================
// Carrinho persistente — lógica de servidor compartilhada pelas rotas de API
// =============================================================================
// Carrinho de VERDADE, como em qualquer loja virtual séria: exige login.
// Não existe mais carrinho de convidado — cada CartItem pertence a um
// User autenticado (Cart.userId), nunca a uma sessão anônima. Isso elimina
// qualquer "estado de exemplo" pré-preenchido e obriga o cliente a se
// cadastrar/entrar antes de comprar, exatamente como pedido.
// =============================================================================

import { prisma } from './prisma';
import { getCurrentUser } from './auth';

function mapCartItem(item) {
  const p = item.product;
  const images = (p.images || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: item.id,
    productId: p.id,
    legacyCode: p.legacyCode,
    slug: p.slug,
    name: p.name,
    image: images[0]?.url || null,
    price: Number(p.price),
    stock: p.stock,
    weightGrams: p.weightGrams,
    qty: item.quantity,
    categoryName: p.category?.name || null,
    year: p.year,
    state: p.state,
    certificate: p.certificate,
  };
}

/** Retorna (criando se necessário) o carrinho do usuário autenticado. Sem login, não há carrinho. */
export async function getOrCreateActiveCart() {
  const user = await getCurrentUser();
  if (!user) return { cart: null, user: null };

  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }
  return { cart, user };
}

export async function getCartItems() {
  const { cart } = await getOrCreateActiveCart();
  if (!cart) return [];
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: { include: { images: true, category: true } } },
    orderBy: { addedAt: 'asc' },
  });
  return items.map(mapCartItem);
}

export async function addToCart(productId, qty = 1) {
  const { cart, user } = await getOrCreateActiveCart();
  if (!user) return { ok: false, reason: 'auth-required' };

  const product = await prisma.product.findFirst({
    where: { OR: [{ id: productId }, { legacyCode: productId }] },
  });
  if (!product) return { ok: false, reason: 'not-found' };

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } },
  });
  const currentQty = existing ? existing.quantity : 0;
  const stock = typeof product.stock === 'number' ? product.stock : Infinity;

  if (currentQty + qty > stock) {
    return { ok: false, reason: 'out-of-stock', available: Math.max(0, stock - currentQty) };
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + qty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, quantity: qty },
    });
  }
  return { ok: true };
}

export async function updateCartItemQty(itemId, qty) {
  const { cart, user } = await getOrCreateActiveCart();
  if (!user) return { ok: false, reason: 'auth-required' };
  if (!cart) return { ok: false, reason: 'not-found' };
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: true },
  });
  if (!item) return { ok: false, reason: 'not-found' };

  const stock = typeof item.product.stock === 'number' ? item.product.stock : Infinity;
  const nextQty = Math.max(1, qty);
  if (nextQty > stock) {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: stock } });
    return { ok: false, reason: 'out-of-stock', available: stock };
  }
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: nextQty } });
  return { ok: true };
}

export async function removeCartItem(itemId) {
  const { cart, user } = await getOrCreateActiveCart();
  if (!user) return { ok: false, reason: 'auth-required' };
  if (!cart) return { ok: false, reason: 'not-found' };
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  return { ok: true };
}

export async function clearCart() {
  const { cart, user } = await getOrCreateActiveCart();
  if (!user) return { ok: false, reason: 'auth-required' };
  if (!cart) return { ok: true };
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return { ok: true };
}

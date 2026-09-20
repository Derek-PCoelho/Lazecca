// =============================================================================
// Carrinho persistente — lógica de servidor compartilhada pelas rotas de API
// =============================================================================
// Suporta tanto usuários logados (Cart.userId) quanto visitantes (Cart.sessionToken,
// identificados por cookie httpOnly `lz_guest`, ver lib/guestSession.js).
// Quando um convidado com carrinho faz login, o carrinho de convidado é
// mesclado ao carrinho do usuário (ver mergeGuestCartIntoUser).
// =============================================================================

import { prisma } from './prisma';
import { getCurrentUser } from './auth';
import { getOrCreateGuestToken, getGuestToken } from './guestSession';

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
    qty: item.quantity,
    categoryName: p.category?.name || null,
    year: p.year,
    state: p.state,
    certificate: p.certificate,
  };
}

/** Retorna (criando se necessário) o carrinho ativo — do usuário logado ou do convidado. */
export async function getOrCreateActiveCart({ createGuestIfMissing = true } = {}) {
  const user = await getCurrentUser();

  if (user) {
    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }
    return { cart, user };
  }

  const token = createGuestIfMissing ? await getOrCreateGuestToken() : await getGuestToken();
  if (!token) return { cart: null, user: null };

  let cart = await prisma.cart.findUnique({ where: { sessionToken: token } });
  if (!cart && createGuestIfMissing) {
    cart = await prisma.cart.create({ data: { sessionToken: token } });
  }
  return { cart, user: null };
}

export async function getCartItems() {
  const { cart } = await getOrCreateActiveCart({ createGuestIfMissing: false });
  if (!cart) return [];
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: { include: { images: true, category: true } } },
    orderBy: { addedAt: 'asc' },
  });
  return items.map(mapCartItem);
}

export async function addToCart(productId, qty = 1) {
  const { cart } = await getOrCreateActiveCart();
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
  const { cart } = await getOrCreateActiveCart({ createGuestIfMissing: false });
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
  const { cart } = await getOrCreateActiveCart({ createGuestIfMissing: false });
  if (!cart) return { ok: false, reason: 'not-found' };
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  return { ok: true };
}

export async function clearCart() {
  const { cart } = await getOrCreateActiveCart({ createGuestIfMissing: false });
  if (!cart) return { ok: true };
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return { ok: true };
}

/** Ao logar, funde o carrinho do convidado (se existir) no carrinho do usuário. */
export async function mergeGuestCartIntoUser(userId) {
  const guestToken = await getGuestToken();
  if (!guestToken) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionToken: guestToken },
    include: { items: true },
  });
  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await prisma.cart.findUnique({ where: { userId } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId } });
  }

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: userCart.id, productId: item.productId, quantity: item.quantity },
      });
    }
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
}

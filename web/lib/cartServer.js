// =============================================================================
// Carrinho persistente — lógica de servidor compartilhada pelas rotas de API
// =============================================================================
// Fase 11 (adendo) — Carrinho de CONVIDADO reintroduzido a pedido do cliente:
//   - Visitante SEM login pode adicionar/editar/remover itens do carrinho
//     normalmente. O carrinho de convidado é identificado por um cookie
//     httpOnly próprio (lz_guest_cart, 30 dias), nunca pelo cookie de sessão
//     de autenticação (lz_session) — são conceitos independentes.
//   - Ao logar OU se cadastrar com sucesso, o carrinho de convidado (se
//     existir) é migrado automaticamente para o carrinho do usuário
//     autenticado (ver `mergeGuestCartIntoUser`), respeitando o estoque
//     disponível de cada peça, e o cookie de convidado é descartado.
//   - Para PROSSEGUIR COM A COMPRA (checkout / POST /api/orders), login
//     continua obrigatório — isso não muda. Apenas visualizar/montar o
//     carrinho passou a não exigir mais conta.
// =============================================================================

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { getCurrentUser } from './auth';

const GUEST_CART_COOKIE = 'lz_guest_cart';
const GUEST_CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias — carrinho de convidado sobrevive a várias visitas

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

/** Lê o token do cookie de carrinho de convidado; cria e grava um novo se `create: true` e nenhum existir. */
async function getGuestSessionToken({ create = false } = {}) {
  const store = await cookies();
  let token = store.get(GUEST_CART_COOKIE)?.value;
  if (!token && create) {
    token = crypto.randomUUID();
    store.set(GUEST_CART_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: GUEST_CART_MAX_AGE,
    });
  }
  return token || null;
}

async function clearGuestCartCookie() {
  const store = await cookies();
  store.delete(GUEST_CART_COOKIE);
}

/**
 * Retorna (criando se necessário) o carrinho ativo da requisição atual:
 *  - Usuário autenticado → carrinho vinculado a ele (Cart.userId).
 *  - Visitante sem login → carrinho de convidado identificado pelo cookie
 *    `lz_guest_cart` (Cart.sessionToken). `createGuestIfMissing` controla se
 *    devemos criar um carrinho de convidado novo quando ainda não existe —
 *    usado ao ADICIONAR um item; leituras (GET) não criam carrinho vazio à
 *    toa só por terem sido chamadas.
 */
export async function getOrCreateActiveCart({ createGuestIfMissing = false } = {}) {
  const user = await getCurrentUser();
  if (user) {
    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }
    return { cart, user };
  }

  // Sem login — carrinho de convidado por cookie.
  const existingToken = await getGuestSessionToken({ create: false });
  if (existingToken) {
    const cart = await prisma.cart.findUnique({ where: { sessionToken: existingToken } });
    if (cart) return { cart, user: null };
  }
  if (!createGuestIfMissing) return { cart: null, user: null };

  const token = await getGuestSessionToken({ create: true });
  const cart = await prisma.cart.create({ data: { sessionToken: token } });
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
  const { cart } = await getOrCreateActiveCart({ createGuestIfMissing: true });

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

/**
 * Chamado ao final de um login/cadastro bem-sucedido (depois de
 * setSessionCookie). Se havia um carrinho de convidado (cookie
 * `lz_guest_cart`), migra os itens para o carrinho do usuário recém
 * autenticado — item a item, respeitando o estoque disponível — e descarta
 * o carrinho de convidado (linha + cookie). Não faz nada se não havia
 * carrinho de convidado (visitante que já foi direto para login/cadastro
 * sem passar pelo carrinho).
 */
export async function mergeGuestCartIntoUser(userId) {
  const guestToken = await getGuestSessionToken({ create: false });
  if (!guestToken) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionToken: guestToken },
    include: { items: true },
  });

  if (!guestCart) {
    await clearGuestCartCookie();
    return;
  }

  if (guestCart.items.length === 0) {
    await prisma.cart.delete({ where: { id: guestCart.id } });
    await clearGuestCartCookie();
    return;
  }

  const userCart = await prisma.cart.findUnique({ where: { userId } });

  if (!userCart) {
    // Usuário ainda não tinha carrinho próprio — simplesmente "adota" o
    // carrinho de convidado como seu (reaproveita a linha e os CartItems,
    // sem precisar recriar nada).
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { userId, sessionToken: null },
    });
    await clearGuestCartCookie();
    return;
  }

  // Usuário já tinha carrinho próprio (ex.: adicionou itens logado em outra
  // sessão/dispositivo antes) — faz merge item a item, respeitando o
  // estoque disponível de cada peça, depois descarta o carrinho de convidado.
  for (const guestItem of guestCart.items) {
    const product = await prisma.product.findUnique({
      where: { id: guestItem.productId },
      select: { stock: true },
    });
    const stock = typeof product?.stock === 'number' ? product.stock : Infinity;
    if (stock <= 0) continue;

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: userCart.id, productId: guestItem.productId } },
    });
    const currentQty = existing ? existing.quantity : 0;
    const mergedQty = Math.min(stock, currentQty + guestItem.quantity);
    if (mergedQty <= 0) continue;

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: mergedQty } });
    } else {
      await prisma.cartItem.create({
        data: { cartId: userCart.id, productId: guestItem.productId, quantity: mergedQty },
      });
    }
  }

  // onDelete: Cascade no schema remove os CartItems do carrinho de convidado
  // junto com a linha do Cart.
  await prisma.cart.delete({ where: { id: guestCart.id } });
  await clearGuestCartCookie();
}

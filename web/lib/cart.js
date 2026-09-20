'use client';

// La Zecca — Carrinho persistente (Fase 8)
// Substitui o localStorage por chamadas reais à API (/api/cart/*), que por
// sua vez persiste no banco (Cart/CartItem, Prisma) — tanto para usuários
// logados quanto visitantes (sessão de convidado via cookie httpOnly).

const CART_EVENT = 'lz-cart-changed';

function notifyChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_EVENT));
  }
}

export async function getCartItems() {
  try {
    const res = await fetch('/api/cart', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((i) => ({
      id: i.productId, // compat: código usado como "id" do produto na UI
      qty: i.qty,
      product: {
        id: i.legacyCode,
        dbId: i.productId,
        slug: i.slug,
        name: i.name,
        image: i.image,
        price: i.price,
        stock: i.stock,
        categoryName: i.categoryName,
        year: i.year,
        state: i.state,
        certificate: i.certificate,
      },
      cartItemId: i.id,
    }));
  } catch {
    return [];
  }
}

export async function addToCart(productId, qty = 1) {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty }),
    });
    const data = await res.json();
    notifyChanged();
    return data;
  } catch {
    return { ok: false, reason: 'network-error' };
  }
}

export async function removeFromCart(cartItemId) {
  try {
    await fetch(`/api/cart/${cartItemId}`, { method: 'DELETE' });
  } finally {
    notifyChanged();
  }
}

export async function updateQty(cartItemId, qty) {
  try {
    const res = await fetch(`/api/cart/${cartItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty }),
    });
    const data = await res.json();
    notifyChanged();
    return data;
  } catch {
    return { ok: false, reason: 'network-error' };
  } finally {
    notifyChanged();
  }
}

export async function clearCart() {
  try {
    await fetch('/api/cart', { method: 'DELETE' });
  } finally {
    notifyChanged();
  }
}

export async function cartCount() {
  const items = await getCartItems();
  return items.reduce((s, i) => s + i.qty, 0);
}

export async function cartSubtotal() {
  const items = await getCartItems();
  return items.reduce((s, i) => s + i.product.price * i.qty, 0);
}

export const CART_CHANGED_EVENT = CART_EVENT;

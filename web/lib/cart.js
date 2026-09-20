'use client';

// La Zecca — Carrinho client-side
// Replica window.LZ do protótipo (design_files/js/data.js), usando localStorage
// (chave 'lz_cart') até que autenticação real e backend existam (Fase Futura — item 3).

import { getProductBySlug, ALL_PRODUCTS } from '@/lib/data';

const CART_KEY = 'lz_cart';
const CART_EVENT = 'lz-cart-changed';

function getProductById(id) {
  return ALL_PRODUCTS.find((p) => p.id === id) || getProductBySlug(id);
}

export function getCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function setCart(cart) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

// Melhoria 13 — Controle de estoque: bloqueia adição além do estoque disponível
// (campo `stock`, alimentado pela coluna Quantidade da planilha real).
export function addToCart(productId, qty = 1) {
  const product = getProductById(productId);
  if (!product) return { ok: false, reason: 'not-found' };

  const cart = getCart();
  const existing = cart.find((i) => i.id === productId);
  const currentQty = existing ? existing.qty : 0;
  const stock = typeof product.stock === 'number' ? product.stock : Infinity;

  if (currentQty + qty > stock) {
    return { ok: false, reason: 'out-of-stock', available: Math.max(0, stock - currentQty) };
  }

  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty });
  setCart(cart);
  return { ok: true };
}

export function removeFromCart(productId) {
  setCart(getCart().filter((i) => i.id !== productId));
}

export function updateQty(productId, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return { ok: false, reason: 'not-found' };
  const product = getProductById(productId);
  const stock = product && typeof product.stock === 'number' ? product.stock : Infinity;
  const nextQty = Math.max(1, qty);
  if (nextQty > stock) {
    item.qty = stock;
    setCart(cart);
    return { ok: false, reason: 'out-of-stock', available: stock };
  }
  item.qty = nextQty;
  setCart(cart);
  return { ok: true };
}

export function clearCart() {
  setCart([]);
}

export function cartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

export function cartSubtotal() {
  return getCart().reduce((s, i) => {
    const p = getProductById(i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
}

export function getCartItems() {
  return getCart()
    .map((c) => ({ ...c, product: getProductById(c.id) }))
    .filter((i) => i.product);
}

export const CART_CHANGED_EVENT = CART_EVENT;

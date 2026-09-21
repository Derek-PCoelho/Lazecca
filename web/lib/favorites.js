'use client';

// La Zecca — Peças Favoritas (wishlist real, persistida em banco, por usuário
// autenticado). Sem login não há favoritos — igual ao carrinho.

const FAVORITES_EVENT = 'lz-favorites-changed';

function notifyChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
  }
}

export async function getFavorites() {
  try {
    const res = await fetch('/api/favorites', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.favorites || [];
  } catch {
    return [];
  }
}

export async function isFavorite(productId) {
  try {
    const res = await fetch(`/api/favorites/${productId}`, { cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.favorited;
  } catch {
    return false;
  }
}

/** Alterna favorito. Retorna { ok, favorited, reason }. */
export async function toggleFavorite(productId, currentlyFavorited) {
  try {
    let res;
    if (currentlyFavorited) {
      res = await fetch(`/api/favorites/${productId}`, { method: 'DELETE' });
    } else {
      res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
    }
    const data = await res.json();
    if (!res.ok) return { ok: false, reason: res.status === 401 ? 'auth-required' : 'error', ...data };
    notifyChanged();
    return { ok: true, favorited: !!data.favorited };
  } catch {
    return { ok: false, reason: 'network-error' };
  }
}

export const FAVORITES_CHANGED_EVENT = FAVORITES_EVENT;

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/data';
import { getFavorites, toggleFavorite, FAVORITES_CHANGED_EVENT } from '@/lib/favorites';
import { addToCart } from '@/lib/cart';

// Bloco 1 — versão embutida na dashboard de "Minha Conta" (o link do menu
// lateral "Peças Favoritas" apontava para href="#"; agora abre esta aba,
// que reaproveita a mesma lógica de /favoritos).
export default function FavoritesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = () => getFavorites().then((favs) => mounted && (setItems(favs), setLoading(false)));
    load();
    window.addEventListener(FAVORITES_CHANGED_EVENT, load);
    return () => {
      mounted = false;
      window.removeEventListener(FAVORITES_CHANGED_EVENT, load);
    };
  }, []);

  const handleRemove = async (productId) => {
    setBusyId(productId);
    const result = await toggleFavorite(productId, true);
    if (result.ok) setItems((prev) => prev.filter((it) => it.productId !== productId));
    setBusyId(null);
  };

  const handleAddToCart = async (productId, name) => {
    setBusyId(productId);
    const result = await addToCart(productId, 1);
    if (result.ok) {
      setFeedback(`"${name}" adicionado ao carrinho.`);
      setTimeout(() => setFeedback(''), 3000);
    }
    setBusyId(null);
  };

  return (
    <>
      <div className="dash-header">
        <span className="eyebrow">Minha Conta</span>
        <h2>Peças Favoritas</h2>
        <p style={{ color: 'var(--ink-500)', marginTop: 8 }}>Peças que você salvou para acompanhar.</p>
      </div>

      {feedback && (
        <div style={{ background: 'var(--gold-100)', color: 'var(--burgundy-800)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20 }}>
          {feedback}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--ink-500)' }}>Carregando...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-500)' }}>
          <p>Nenhuma peça favoritada ainda.</p>
          <Link href="/catalogo" className="btn btn-primary btn-lg" style={{ marginTop: 16 }}>Ir ao catálogo</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {items.map((fav) => {
            const outOfStock = typeof fav.stock === 'number' && fav.stock <= 0;
            return (
              <div key={fav.productId} className="card" style={{ padding: 12 }}>
                <Link href={`/produto/${fav.slug}`} style={{ display: 'block', aspectRatio: '1', background: 'var(--cream)', borderRadius: 8, marginBottom: 8, position: 'relative' }}>
                  <Image
                    src={fav.image ? `/${fav.image}` : '/assets/logo-emblem.png'}
                    alt={fav.name}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </Link>
                <Link href={`/produto/${fav.slug}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-800)', display: 'block', marginBottom: 4 }}>
                  {fav.name}
                </Link>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{formatPrice(fav.price)}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {outOfStock ? (
                    <button className="btn btn-outline btn-sm" disabled style={{ flex: 1 }}>Esgotado</button>
                  ) : (
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} disabled={busyId === fav.productId} onClick={() => handleAddToCart(fav.productId, fav.name)}>
                      Comprar
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" disabled={busyId === fav.productId} onClick={() => handleRemove(fav.productId)}>
                    Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

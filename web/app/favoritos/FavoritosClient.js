'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { formatPrice } from '@/lib/data';
import { getFavorites, toggleFavorite, FAVORITES_CHANGED_EVENT } from '@/lib/favorites';
import { addToCart } from '@/lib/cart';

// Bloco 1 — Página /favoritos real (antes o ícone de favoritos no header
// apontava para um link morto). Lista, permite adicionar ao carrinho e
// remover peças da wishlist do usuário autenticado.
export default function FavoritosClient() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/favorites', { cache: 'no-store' });
        if (res.status === 401) {
          if (mounted) {
            setAuthRequired(true);
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (mounted) {
          setItems(data.favorites || []);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
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
    if (result.ok) {
      setItems((prev) => prev.filter((it) => it.productId !== productId));
    }
    setBusyId(null);
  };

  const handleAddToCart = async (productId, name) => {
    setBusyId(productId);
    const result = await addToCart(productId, 1);
    if (!result.ok && result.reason === 'auth-required') {
      router.push(`/conta?redirect=${encodeURIComponent('/favoritos')}`);
      return;
    }
    if (result.ok) {
      setFeedback(`"${name}" adicionado ao carrinho.`);
      setTimeout(() => setFeedback(''), 3000);
    } else if (result.reason === 'out-of-stock') {
      setFeedback(`"${name}" está fora de estoque.`);
      setTimeout(() => setFeedback(''), 3000);
    }
    setBusyId(null);
  };

  return (
    <>
      <Header page="favoritos" />

      <section className="page-hero" style={{ padding: '48px 0 32px' }}>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <span>Peças Favoritas</span>
          </div>
          <h1 className="h1">Peças Favoritas</h1>
          <p className="lede">
            {authRequired
              ? 'Entre na sua conta para ver e gerenciar suas peças favoritas.'
              : `${items.length} ${items.length === 1 ? 'peça salva' : 'peças salvas'}`}
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: '0 0 96px' }}>
        {feedback && (
          <div
            style={{
              background: 'var(--gold-100)',
              color: 'var(--burgundy-800)',
              padding: '12px 16px',
              borderRadius: 'var(--radius)',
              marginBottom: 20,
            }}
          >
            {feedback}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--ink-500)', textAlign: 'center', padding: '64px 0' }}>Carregando...</p>
        ) : authRequired ? (
          <div className="empty-cart" style={{ textAlign: 'center', padding: '64px 0' }}>
            <div className="icon-big">
              <Icon name="heart" size={40} />
            </div>
            <h3 className="h3">Você precisa estar logado</h3>
            <p style={{ color: 'var(--ink-500)', margin: '8px 0 24px' }}>
              Faça login ou cadastre-se para salvar e ver suas peças favoritas.
            </p>
            <Link
              href={`/conta?redirect=${encodeURIComponent('/favoritos')}`}
              className="btn btn-primary btn-lg"
            >
              Entrar / Cadastrar
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-cart" style={{ textAlign: 'center', padding: '64px 0' }}>
            <div className="icon-big">
              <Icon name="heart" size={40} />
            </div>
            <h3 className="h3">Nenhuma peça favoritada ainda</h3>
            <p style={{ color: 'var(--ink-500)', margin: '8px 0 24px' }}>
              Explore o acervo e clique no coração de uma peça para salvá-la aqui.
            </p>
            <Link href="/catalogo" className="btn btn-primary btn-lg">
              Ir ao catálogo
            </Link>
          </div>
        ) : (
          <div className="products-grid" style={{ marginTop: 24 }}>
            {items.map((fav) => {
              const outOfStock = typeof fav.stock === 'number' && fav.stock <= 0;
              return (
                <div key={fav.productId} className="product-card card">
                  <Link href={`/produto/${fav.slug}`} className="product-media" style={{ display: 'block' }}>
                    <Image
                      src={fav.image ? `/${fav.image}` : '/assets/logo-emblem.png'}
                      alt={fav.name}
                      width={400}
                      height={400}
                      style={{ objectFit: 'contain' }}
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(fav.productId)}
                    disabled={busyId === fav.productId}
                    title="Remover dos favoritos"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--danger)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Icon name="x" size={16} />
                  </button>
                  <div className="product-body">
                    <div className="product-cat">{fav.categoryName}</div>
                    <Link href={`/produto/${fav.slug}`} className="product-name" style={{ display: 'block' }}>
                      {fav.name}
                    </Link>
                    <div className="product-meta">
                      {fav.year > 0 && <span>{fav.year}</span>}
                      {fav.state && <span> · {fav.state}</span>}
                    </div>
                    <div className="product-footer">
                      <div className="price">{formatPrice(fav.price)}</div>
                      {outOfStock ? (
                        <button className="btn btn-outline btn-sm" disabled title="Peça única, indisponível">
                          Esgotado
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={busyId === fav.productId}
                          onClick={() => handleAddToCart(fav.productId, fav.name)}
                        >
                          <Icon name="cart" size={14} /> Comprar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import { formatPrice } from '@/lib/data';
import { addToCart } from '@/lib/cart';

// Recriado literalmente de design_files/js/components.jsx — ProductCard
// Melhoria 14: link para /produto/[slug] (antes product.html?id=)
// Melhoria 13: botão "Comprar" respeita estoque (stock alimentado pela coluna Quantidade
// da planilha real) — exibe "Esgotado" e desabilita quando stock <= 0.
export default function ProductCard({ product: p }) {
  const outOfStock = typeof p.stock === 'number' && p.stock <= 0;

  const handleBuy = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addToCart(p.id);
  };

  return (
    <Link href={`/produto/${p.slug}`} className="product-card card">
      <div className="product-media">
        <Image src={`/${p.image}`} alt={p.name} width={400} height={400} style={{ objectFit: 'contain' }} />
        <div className="product-seals">
          {p.seals?.includes('rare') && (
            <span className="seal seal-rare">
              <Icon name="sparkles" size={12} /> Rara
            </span>
          )}
          {p.seals?.includes('authenticated') && (
            <span className="seal">
              <Icon name="shield" size={12} /> Autenticada
            </span>
          )}
          {p.quantidade > 1 && p.isSequencia && <span className="seal seal-burgundy">Sequência · {p.quantidade}</span>}
          {p.quantidade > 1 && !p.isSequencia && <span className="seal seal-burgundy">Lote · {p.quantidade}</span>}
        </div>
        <span className="quickview">Ver detalhes →</span>
      </div>
      <div className="product-body">
        <div className="product-cat">{p.categoryName}</div>
        <div className="product-name">{p.name}</div>
        <div className="product-meta">
          {p.year > 0 && <span>{p.year}</span>}
          {p.year < 0 && <span>{Math.abs(p.year)} a.C.</span>}
          {p.state !== 'Novo' && (
            <span>
              · <b>{p.state}</b>
            </span>
          )}
          {p.state === 'Novo' && <span>· Novo</span>}
          {p.serie && <span>· Série {p.serie.split(';')[0].trim().substring(0, 8)}</span>}
        </div>
        <div className="product-footer">
          <div>
            <div className="price">{formatPrice(p.price)}</div>
            {p.priceOld && (
              <div style={{ fontSize: 12, color: 'var(--ink-400)', textDecoration: 'line-through' }}>
                {formatPrice(p.priceOld)}
              </div>
            )}
          </div>
          {outOfStock ? (
            <button className="btn btn-outline btn-sm" disabled title="Peça única, indisponível">
              Esgotado
            </button>
          ) : (
            <button className="btn btn-outline btn-sm" onClick={handleBuy}>
              <Icon name="cart" size={14} /> Comprar
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

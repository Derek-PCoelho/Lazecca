'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import ProductCard from '@/components/ProductCard';
import { formatPrice } from '@/lib/data';
import { addToCart } from '@/lib/cart';
import { PIX_DISCOUNT_RATE, INSTALLMENTS_MAX } from '@/lib/config';

// Recriado literalmente de design_files/product.html
// Melhoria 1: galeria usa product.images[] (array real, sem efeitos CSS simulados
// de rotateY/rotate/sepia que fingiam múltiplas fotos a partir de uma única imagem).
//   Enquanto o array tiver só 1 foto, mostramos a imagem única sem thumbs simulados —
//   placeholder honesto até chegarem as fotos reais tiradas na loja.
// Melhoria 13: qty selector e botão de compra respeitam o campo `stock`.
export default function ProductClient({ product, related }) {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [activeImage, setActiveImage] = useState(0);
  const [stockMsg, setStockMsg] = useState('');

  const isCedula = product.category === 'cedulas-br' || product.category === 'cedulas-int';
  const parcela = product.price / INSTALLMENTS_MAX;
  const pixPrice = product.price * (1 - PIX_DISCOUNT_RATE);
  const images = product.images && product.images.length ? product.images : [product.image];
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const maxQty = typeof product.stock === 'number' ? product.stock : 99;

  const handleAdd = () => {
    const result = addToCart(product.id, qty);
    if (!result.ok) {
      if (result.reason === 'out-of-stock') {
        setStockMsg(`Só temos ${result.available} unidade(s) desta peça em estoque.`);
      }
      return;
    }
    window.location.href = '/carrinho';
  };

  return (
    <>
      <Header page="catalog" />

      <div className="product-page">
        <div className="container">
          <div className="product-breadcrumb">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <Link href="/catalogo">Catálogo</Link>
            <span className="sep">/</span>
            <Link href={`/catalogo?cat=${product.category}`}>{product.categoryName}</Link>
            <span className="sep">/</span>
            <span className="current">{product.name}</span>
          </div>

          <div className="product-layout">
            <div className="product-gallery">
              <div className="gallery-main">
                <span className="face-tag">{isCedula ? 'Frente' : 'Anverso'}</span>
                <Image src={`/${images[activeImage]}`} alt={product.name} width={600} height={600} style={{ objectFit: 'contain' }} />
                <button className="zoom-btn" aria-label="Aumentar">
                  <Icon name="zoom-in" size={16} />
                </button>
              </div>
              {images.length > 1 ? (
                <div className="gallery-thumbs">
                  {images.map((img, i) => (
                    <div key={img + i} className={`gallery-thumb ${i === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(i)}>
                      <Image src={`/${img}`} alt="" width={100} height={100} style={{ objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--ink-400)', textAlign: 'center', marginTop: 8 }}>
                  Fotografia única disponível para esta peça — mais ângulos em breve.
                </p>
              )}
            </div>

            <div className="product-details">
              <div className="product-cat-line">
                {product.categoryName} · {product.country} · Ref. {product.referenciaCatalogo || 'LZ'}
              </div>
              <h1>{product.name}</h1>

              {product.figura && (
                <div
                  style={{
                    marginTop: 12,
                    marginBottom: 4,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 17,
                    fontStyle: 'italic',
                    color: 'var(--ink-500)',
                  }}
                >
                  Retrato de{' '}
                  <b style={{ color: 'var(--burgundy-700)', fontStyle: 'normal' }}>{product.figura}</b>
                  {product.periodo && ` · ${product.periodo}`}
                </div>
              )}

              <div className="product-seals-row">
                {product.seals?.includes('rare') && (
                  <span className="seal seal-rare">
                    <Icon name="sparkles" size={12} /> {product.rarity}
                  </span>
                )}
                {product.seals?.includes('authenticated') && (
                  <span className="seal">
                    <Icon name="shield" size={12} /> Autenticada
                  </span>
                )}
                {product.quantidade > 1 && product.isSequencia && <span className="seal seal-burgundy">Sequência de {product.quantidade}</span>}
                {product.quantidade > 1 && !product.isSequencia && <span className="seal seal-burgundy">Lote de {product.quantidade}</span>}
                {product.variedade === 'Autografada' && <span className="seal seal-outline">Autografada</span>}
                <span className="seal seal-outline">{product.stateShort || product.state}</span>
              </div>

              <div className="price-block">
                <div>
                  <span className="price">{formatPrice(product.price)}</span>
                  {product.priceOld && <span className="price-old">{formatPrice(product.priceOld)}</span>}
                </div>
                <div className="installments">
                  ou até <b>{INSTALLMENTS_MAX}× de {formatPrice(parcela)}</b> sem juros no cartão
                </div>
                <span className="pix-badge">
                  <Icon name="pix" size={14} /> {formatPrice(pixPrice)} no PIX ({PIX_DISCOUNT_RATE * 100}% off)
                </span>
              </div>

              <div className="buy-actions">
                {outOfStock ? (
                  <div style={{ padding: '14px 18px', background: 'var(--gold-100)', borderRadius: 'var(--radius)', color: 'var(--burgundy-800)', fontWeight: 600 }}>
                    Peça única, indisponível
                  </div>
                ) : (
                  <>
                    <div className="qty-selector">
                      <button onClick={() => setQty(Math.max(1, qty - 1))}>
                        <Icon name="minus" size={14} />
                      </button>
                      <input value={qty} readOnly />
                      <button onClick={() => setQty(Math.min(maxQty, qty + 1))}>
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={handleAdd}>
                      <Icon name="cart" size={16} /> Adicionar ao carrinho
                    </button>
                  </>
                )}
                <button className="btn btn-ghost btn-lg" title="Favoritar">
                  <Icon name="heart" size={18} />
                </button>
              </div>
              {stockMsg && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: -20, marginBottom: 20 }}>{stockMsg}</p>}

              <div className="delivery-block">
                <div className="delivery-item">
                  <span className="di-icon">
                    <Icon name="truck" size={20} />
                  </span>
                  <div>
                    <div className="di-title">{product.shipping}</div>
                    <div className="di-sub">Envio em 1-2 dias úteis · Rastreado</div>
                  </div>
                </div>
                <div className="delivery-item">
                  <span className="di-icon">
                    <Icon name="refresh" size={20} />
                  </span>
                  <div>
                    <div className="di-title">7 dias para trocar</div>
                    <div className="di-sub">Direito de arrependimento</div>
                  </div>
                </div>
              </div>

              <div className="auth-card">
                <div className="auth-icon">
                  <Icon name="shield" size={28} />
                </div>
                <div>
                  <h4>Certificado de Autenticidade</h4>
                  <p>Peça verificada e catalogada pelo Dr. Sergio Costa. Acompanha certificado impresso em papel timbrado.</p>
                  <span className="cert-code">Cert. {product.certificate}</span>
                </div>
              </div>

              <div className="spec-table">
                <h3>Ficha Técnica</h3>
                <dl>
                  <dt>Denominação</dt>
                  <dd>{product.denomination}</dd>
                  <dt>Ano de Emissão</dt>
                  <dd>{product.year > 0 ? product.year : `${Math.abs(product.year)} a.C.`}</dd>
                  {product.padrao && (
                    <>
                      <dt>Padrão Monetário</dt>
                      <dd>{product.padrao}</dd>
                    </>
                  )}
                  {product.estampa && (
                    <>
                      <dt>Estampa / Família</dt>
                      <dd>{product.estampa}</dd>
                    </>
                  )}
                  {product.serie && (
                    <>
                      <dt>Série</dt>
                      <dd>{product.serie}</dd>
                    </>
                  )}
                  {product.assinaturas && (
                    <>
                      <dt>Assinaturas</dt>
                      <dd>{product.assinaturas}</dd>
                    </>
                  )}
                  {product.variedade && (
                    <>
                      <dt>Variedade</dt>
                      <dd>{product.variedade}</dd>
                    </>
                  )}
                  <dt>País / Emissão</dt>
                  <dd>{product.country}</dd>
                  <dt>Metal / Material</dt>
                  <dd>{product.metal}</dd>
                  {product.weight !== '—' && (
                    <>
                      <dt>Peso</dt>
                      <dd>{product.weight}</dd>
                    </>
                  )}
                  {product.diameter !== '—' && (
                    <>
                      <dt>Dimensões</dt>
                      <dd>{product.diameter}</dd>
                    </>
                  )}
                  <dt>Estado</dt>
                  <dd>{product.stateFull}</dd>
                  {product.defeitos && (
                    <>
                      <dt>Defeitos observados</dt>
                      <dd>{product.defeitos}</dd>
                    </>
                  )}
                  <dt>Raridade</dt>
                  <dd>{product.rarity}</dd>
                  {product.quantidade > 1 && (
                    <>
                      <dt>Exemplares no lote</dt>
                      <dd>
                        {product.quantidade}
                        {product.isSequencia ? ' (em sequência)' : ''}
                      </dd>
                    </>
                  )}
                  {product.observacoes && (
                    <>
                      <dt>Observações</dt>
                      <dd style={{ fontSize: 13 }}>{product.observacoes}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="product-tabs">
            <div className="tabs-nav">
              <button className={tab === 'description' ? 'active' : ''} onClick={() => setTab('description')}>
                {isCedula ? 'Descrição desta Cédula' : 'Descrição da Peça'}
              </button>
              <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
                Contexto Histórico
              </button>
              <button className={tab === 'conservation' ? 'active' : ''} onClick={() => setTab('conservation')}>
                Estado de Conservação
              </button>
              <button className={tab === 'shipping' ? 'active' : ''} onClick={() => setTab('shipping')}>
                Envio e Devolução
              </button>
            </div>

            <div className="tab-content">
              {tab === 'description' && (
                <>
                  <p>{product.description}</p>
                  {product.observacoes && (
                    <div className="story-highlight">
                      <strong
                        style={{
                          display: 'block',
                          fontSize: 13,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--gold-800)',
                          fontStyle: 'normal',
                          marginBottom: 8,
                        }}
                      >
                        Observação do curador
                      </strong>
                      {product.observacoes}
                    </div>
                  )}
                </>
              )}
              {tab === 'history' && (
                <>
                  <p>{product.history || 'História completa desta peça em preparação.'}</p>
                  {isCedula && product.figura && (
                    <div className="story-highlight">
                      Retrato: <strong style={{ fontStyle: 'normal' }}>{product.figura}</strong>
                      {product.periodo && (
                        <>
                          {' '}
                          · Período: <strong style={{ fontStyle: 'normal' }}>{product.periodo}</strong>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
              {tab === 'conservation' && (
                <>
                  <p>
                    <b>{product.stateFull}</b>
                    {product.stateLabel ? ` — ${product.stateLabel}` : ''}.
                    {product.defeitos
                      ? ` Neste exemplar registram-se os seguintes vestígios de uso: ${product.defeitos.toLowerCase()}.`
                      : ' Este exemplar não apresenta defeitos aparentes.'}
                  </p>
                  <p>
                    A gradação de {isCedula ? 'cédulas' : 'moedas'} segue os padrões da Sociedade Numismática Brasileira.
                    {isCedula
                      ? ' Para cédulas usamos a escala tradicional FE / SOB / MBC / BC — Flor de Estampa é o grau máximo (praticamente sem circulação).'
                      : ' Para moedas internacionais utilizamos também a escala Sheldon (1-70).'}{' '}
                    Todas as peças são fotografadas em alta resolução e você pode solicitar imagens adicionais antes da compra.
                  </p>
                </>
              )}
              {tab === 'shipping' && (
                <>
                  <p>
                    <b>Envio:</b> Enviamos em embalagem sigilosa, acolchoada e com seguro total. Prazo de postagem de 1-2 dias
                    úteis. Frete grátis para todo o Brasil em compras acima de R$ 500.
                  </p>
                  <p>
                    <b>Devolução:</b> Você tem 7 dias corridos após o recebimento para devolver a peça, sem justificativa
                    (Código de Defesa do Consumidor). A peça deve retornar em suas condições originais, na embalagem e com o
                    certificado.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Relacionados */}
          <div className="related-products">
            <div className="section-head">
              <div className="section-title">
                <span className="eyebrow">Peças semelhantes</span>
                <h2 className="h2">Continue explorando</h2>
              </div>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

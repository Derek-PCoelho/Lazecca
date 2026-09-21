'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { formatPrice } from '@/lib/data';
import { getCartItems, removeFromCart, updateQty, CART_CHANGED_EVENT } from '@/lib/cart';
import { PIX_DISCOUNT_RATE, getShippingPrice, INSTALLMENTS_MAX } from '@/lib/config';
import { formatCep, validateCepFormat } from '@/lib/validation';

// Recriado literalmente de design_files/cart.html
// Melhoria 5: REMOVIDO o useEffect que fazia LZ.addToCart('p001') + LZ.addToCart('p004', 2)
// sempre que o carrinho estivesse vazio. O carrinho agora inicia sempre vazio de verdade.
export default function CarrinhoClient() {
  const [items, setItems] = useState([]);
  const [stockWarning, setStockWarning] = useState('');

  // Correção (auditoria pós-lançamento): o bloco "Calcular frete" era um
  // input decorativo sem onChange/onSubmit — digitar um CEP não fazia nada,
  // e o resumo sempre mostrava o valor fixo da tabela local (PAC, R$ 24,90)
  // como "estimativa". Agora o campo chama a mesma API real de frete usada
  // no checkout (/api/shipping/calculate) e, quando o cliente calcula com
  // sucesso, o valor real (por CEP) substitui a estimativa no resumo.
  const [cep, setCep] = useState('');
  const [cepShipping, setCepShipping] = useState(null); // { price, name, days } | null
  const [cepError, setCepError] = useState('');
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = () => getCartItems().then((it) => mounted && setItems(it));
    load();
    window.addEventListener(CART_CHANGED_EVENT, load);
    return () => {
      mounted = false;
      window.removeEventListener(CART_CHANGED_EVENT, load);
    };
  }, []);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  // Frete estimado (tabela local, modalidade PAC) — usado como valor inicial
  // até o cliente calcular pelo CEP real; o cálculo final por transportadora
  // acontece de novo no checkout (Melhoria 6), que é sempre a fonte de verdade.
  const shippingEstimate = getShippingPrice('pac', subtotal);
  const shipping = cepShipping ? cepShipping.price : shippingEstimate;
  const discount = 0;
  const total = subtotal + shipping - discount;
  const pixPrice = total * (1 - PIX_DISCOUNT_RATE);

  // Correção: antes o campo de CEP no resumo não fazia nada. Agora chama a
  // mesma API real de frete usada no checkout (/api/shipping/calculate),
  // usando o peso de cada item do carrinho.
  const handleCalcularFrete = async (e) => {
    e.preventDefault();
    setCepError('');
    const check = validateCepFormat(cep);
    if (!check.valid) {
      setCepError(check.reason);
      return;
    }
    setCepLoading(true);
    setCepShipping(null);
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep,
          subtotal,
          items: items.map((i) => ({ weightGrams: i.product.weightGrams, quantity: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.options) || data.options.length === 0) {
        setCepError(data.error || 'Não foi possível calcular o frete para este CEP.');
        return;
      }
      // No resumo do carrinho mostramos a opção PAC (a mesma modalidade padrão
      // já usada na estimativa) quando disponível; senão, a mais barata.
      const pac = data.options.find((o) => o.id === 'pac' || /pac/i.test(o.name));
      const chosen = pac || data.options.sort((a, b) => a.price - b.price)[0];
      setCepShipping(chosen);
    } catch {
      setCepError('Erro de conexão. Tente novamente.');
    } finally {
      setCepLoading(false);
    }
  };

  const remove = (cartItemId) => removeFromCart(cartItemId);
  const upd = async (cartItemId, qty, product) => {
    const result = await updateQty(cartItemId, qty);
    if (!result.ok && result.reason === 'out-of-stock') {
      setStockWarning(`"${product.name}" tem apenas ${result.available} unidade(s) em estoque.`);
      setTimeout(() => setStockWarning(''), 4000);
    }
  };

  return (
    <>
      <Header page="cart" />

      <section className="page-hero" style={{ padding: '48px 0 32px' }}>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <span>Carrinho</span>
          </div>
          <h1 className="h1">Seu Carrinho</h1>
          <p className="lede">
            {items.length} {items.length === 1 ? 'peça' : 'peças'} · o estoque é confirmado ao finalizar a compra
          </p>
        </div>
      </section>

      <div className="cart-page">
        <div className="container">
          {stockWarning && (
            <div style={{ background: 'var(--gold-100)', color: 'var(--burgundy-800)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20 }}>
              {stockWarning}
            </div>
          )}
          {items.length === 0 ? (
            <div className="empty-cart">
              <div className="icon-big">
                <Icon name="cart" size={40} />
              </div>
              <h3 className="h3">Seu carrinho ainda está vazio</h3>
              <p style={{ color: 'var(--ink-500)', marginTop: 8, marginBottom: 24 }}>
                Explore o acervo e encontre peças que contam histórias.
              </p>
              <Link href="/catalogo" className="btn btn-primary btn-lg">
                Ir ao catálogo
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                <div className="cart-header">
                  <span></span>
                  <span>Peça</span>
                  <span>Quantidade</span>
                  <span>Total</span>
                  <span></span>
                </div>
                {items.map((item) => {
                  const p = item.product;
                  const maxQty = typeof p.stock === 'number' ? p.stock : 99;
                  return (
                    <div key={item.cartItemId} className="cart-row">
                      <Link href={`/produto/${p.slug}`} className="thumb">
                        <Image src={`/${p.image}`} alt={p.name} width={100} height={100} style={{ objectFit: 'contain' }} />
                      </Link>
                      <div className="info">
                        <h4>
                          <Link href={`/produto/${p.slug}`}>{p.name}</Link>
                        </h4>
                        <div className="meta">
                          <span>{p.categoryName}</span>
                          {p.year > 0 && <span>· {p.year}</span>}
                          {p.state !== 'Novo' && <span>· Estado {p.state}</span>}
                        </div>
                        {p.certificate && <span className="cert">Cert. {p.certificate}</span>}
                      </div>
                      <div className="qty">
                        <button onClick={() => upd(item.cartItemId, item.qty - 1, p)}>
                          <Icon name="minus" size={14} />
                        </button>
                        <input value={item.qty} readOnly />
                        <button onClick={() => upd(item.cartItemId, item.qty + 1, p)} disabled={item.qty >= maxQty}>
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <div className="total">{formatPrice(p.price * item.qty)}</div>
                      <button className="remove" onClick={() => remove(item.cartItemId)} title="Remover" aria-label={`Remover ${p.name}`}>
                        <Icon name="x" size={16} />
                      </button>
                    </div>
                  );
                })}
                <div className="cart-footer">
                  <Link href="/catalogo" className="btn btn-ghost">
                    ← Continuar explorando
                  </Link>
                  <div className="coupon-row">
                    <input placeholder="Cupom de desconto" />
                    <button className="btn btn-outline">Aplicar</button>
                  </div>
                </div>
              </div>

              <div className="summary">
                <h3>Resumo do Pedido</h3>
                <div className="summary-row">
                  <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} peças)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>{cepShipping ? `Frete (${cepShipping.name})` : 'Frete (estimado)'}</span>
                  <span>{shipping === 0 ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>Grátis</span> : formatPrice(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row">
                    <span>Desconto</span>
                    <span style={{ color: 'var(--danger)' }}>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="cep-block">
                  <label>Calcular frete</label>
                  <form className="cep-form" onSubmit={handleCalcularFrete}>
                    <input
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => setCep(formatCep(e.target.value))}
                      inputMode="numeric"
                      aria-label="CEP para calcular o frete"
                    />
                    <button className="btn btn-ghost btn-sm" type="submit" disabled={cepLoading}>
                      {cepLoading ? '...' : 'OK'}
                    </button>
                  </form>
                  {cepError && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{cepError}</p>}
                  {cepShipping && (
                    <p style={{ color: 'var(--success)', fontSize: 12, marginTop: 6 }}>
                      {cepShipping.name} · {cepShipping.days} · {cepShipping.price === 0 ? 'Grátis' : formatPrice(cepShipping.price)}
                    </p>
                  )}
                </div>

                <div className="summary-row total">
                  <span>
                    <b>Total</b>
                  </span>
                  <span className="val">{formatPrice(total)}</span>
                </div>
                <div className="installments-note">
                  em até {INSTALLMENTS_MAX}× de {formatPrice(total / INSTALLMENTS_MAX)} sem juros
                </div>

                <div className="pix-highlight">
                  <strong>
                    <Icon name="pix" size={14} /> À vista no PIX
                  </strong>
                  <span>{formatPrice(pixPrice)}</span>
                </div>

                <Link href="/checkout" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 16 }}>
                  Finalizar compra <Icon name="chevron-right" size={16} />
                </Link>

                <div className="trust-row">
                  <div className="trust-item">
                    <Icon name="shield" size={22} />
                    <span>Autenticada</span>
                  </div>
                  <div className="trust-item">
                    <Icon name="truck" size={22} />
                    <span>Envio Seguro</span>
                  </div>
                  <div className="trust-item">
                    <Icon name="refresh" size={22} />
                    <span>7d Devolução</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

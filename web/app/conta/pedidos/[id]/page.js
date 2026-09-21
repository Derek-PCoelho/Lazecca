'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { formatPrice } from '@/lib/data';
import { STATUS_LABELS } from '../../OrdersTab';

// Bloco 1 — "Ver detalhes" do pedido não tinha ação nenhuma. Esta página
// consome /api/orders/[id] (que já existia) e mostra tudo: itens, status,
// valores, endereço de entrega, código de rastreio (se houver) e permite
// cancelar o pedido dentro do prazo de arrependimento (Bloco 8).
const PAYMENT_METHOD_LABELS = { pix: 'PIX', card: 'Cartão de crédito', credit_card: 'Cartão de crédito', boleto: 'Boleto bancário' };
const CANCELLABLE_STATUSES = ['AWAITING_PAYMENT', 'PAID', 'PROCESSING'];
const REGRET_PERIOD_DAYS = 7;

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Pedido não encontrado.');
        return;
      }
      setOrder(data.order);
    } catch {
      setError('Erro de conexão ao carregar o pedido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar este pedido? Essa ação não pode ser desfeita.')) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelado pelo cliente via Minha Conta.' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error || 'Não foi possível cancelar o pedido.');
        return;
      }
      await load();
    } catch {
      setCancelError('Erro de conexão. Tente novamente.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header page="account" />
        <div className="container" style={{ padding: '96px 0', textAlign: 'center', color: 'var(--ink-500)' }}>Carregando...</div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header page="account" />
        <div className="container" style={{ padding: '96px 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error || 'Pedido não encontrado.'}</p>
          <Link href="/conta" className="btn btn-primary">Voltar para Minha Conta</Link>
        </div>
        <Footer />
      </>
    );
  }

  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, cls: '' };
  const daysSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const canCancel = CANCELLABLE_STATUSES.includes(order.status) && daysSinceOrder <= REGRET_PERIOD_DAYS;

  return (
    <>
      <Header page="account" />
      <div className="container" style={{ padding: '48px 0 96px', maxWidth: 800 }}>
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <Link href="/">Início</Link>
          <span className="sep">/</span>
          <Link href="/conta">Minha Conta</Link>
          <span className="sep">/</span>
          <span>Pedido {order.orderNumber}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 className="h1" style={{ fontSize: 28 }}>Pedido {order.orderNumber}</h1>
            <p style={{ color: 'var(--ink-500)', marginTop: 4 }}>
              Realizado em {new Date(order.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <span className={`order-status ${statusInfo.cls}`} style={{ fontSize: 14 }}>{statusInfo.label}</span>
        </div>

        {order.status === 'CANCELLED' && (
          <div style={{ background: '#fdecea', color: '#a12f2f', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 24, fontSize: 13 }}>
            Pedido cancelado em {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString('pt-BR') : '—'}.
            {order.cancelReason && <> Motivo: {order.cancelReason}</>}
          </div>
        )}

        {order.trackingCode && (
          <div style={{ background: 'var(--gold-100)', color: 'var(--burgundy-800)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 24, fontSize: 14 }}>
            <Icon name="truck" size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Código de rastreio: <b>{order.trackingCode}</b>
          </div>
        )}

        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Itens do pedido</h3>
        <div className="card" style={{ padding: 0, marginBottom: 24, overflow: 'hidden' }}>
          {order.items.map((item, idx) => {
            const img = item.product?.images?.[0]?.url;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', gap: 16, alignItems: 'center', padding: '16px 20px',
                  borderTop: idx > 0 ? '1px solid var(--line-soft)' : 'none',
                }}
              >
                {img && (
                  <div style={{ width: 56, height: 56, position: 'relative', flexShrink: 0, background: 'var(--cream)', borderRadius: 6 }}>
                    <Image src={`/${img}`} alt={item.productName} fill style={{ objectFit: 'contain' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, color: 'var(--ink-800)' }}>{item.productName}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>
                    Qtd: {item.quantity} · {formatPrice(item.unitPrice)} cada
                  </div>
                  {item.product?.certificate && (
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>
                      Certificado: <code>{item.product.certificate}</code>
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 600 }}>{formatPrice(Number(item.unitPrice) * item.quantity)}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Endereço de entrega</h3>
            <div className="card" style={{ padding: 16, fontSize: 14, color: 'var(--ink-700)', lineHeight: 1.6 }}>
              {order.shippingStreet}, {order.shippingNumber} {order.shippingComplement && `- ${order.shippingComplement}`}<br />
              {order.shippingNeighborhood} · {order.shippingCity}/{order.shippingState}<br />
              CEP {order.shippingZipCode}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Pagamento</h3>
            <div className="card" style={{ padding: 16, fontSize: 14, color: 'var(--ink-700)', lineHeight: 1.6 }}>
              Método: <b>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</b><br />
              Status: {order.payment?.status || order.paymentStatus}
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Resumo de valores</h3>
        <div className="card" style={{ padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Frete ({order.shippingMethod})</span><span>{formatPrice(order.shippingPrice)}</span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--danger)' }}>
              <span>Desconto</span><span>-{formatPrice(order.discountTotal)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line-soft)', paddingTop: 10, marginTop: 6, fontWeight: 700 }}>
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {cancelError && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{cancelError}</p>}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/conta" className="btn btn-ghost">Voltar para Minha Conta</Link>
          {canCancel && (
            <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelando...' : 'Cancelar pedido'}
            </button>
          )}
        </div>
        {CANCELLABLE_STATUSES.includes(order.status) && !canCancel && order.status !== 'CANCELLED' && (
          <p style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 8 }}>
            O prazo de {REGRET_PERIOD_DAYS} dias para cancelamento pelo site já passou. Entre em contato pelo WhatsApp para ajuda.
          </p>
        )}
      </div>
      <Footer />
    </>
  );
}

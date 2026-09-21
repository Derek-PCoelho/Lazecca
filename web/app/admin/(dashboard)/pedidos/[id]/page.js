'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/data';

const STATUSES = ['AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingSaved, setTrackingSaved] = useState(false);

  const load = useCallback(() => {
    return fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order);
        setTrackingInput(d.order?.trackingCode || '');
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (status) => {
    if (status === 'CANCELLED') {
      const reason = prompt('Motivo do cancelamento (visível para o cliente):', 'Cancelado pelo administrador.');
      if (reason === null) return; // usuário cancelou o prompt
      setSaving(true);
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancelReason: reason }),
      });
      await load();
      setSaving(false);
      return;
    }
    setSaving(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await load();
    setSaving(false);
  };

  const saveTracking = async () => {
    setSaving(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingCode: trackingInput }),
    });
    setTrackingSaved(true);
    setTimeout(() => setTrackingSaved(false), 2000);
    setSaving(false);
  };

  if (!order) return <p>Carregando...</p>;

  return (
    <>
      <h1>Pedido {order.orderNumber}</h1>
      <p className="admin-sub">
        {order.customerName} · {order.customerEmail} · {new Date(order.createdAt).toLocaleString('pt-BR')}
      </p>

      {order.status === 'CANCELLED' && (
        <div style={{ background: '#fdecea', color: '#a12f2f', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
          Cancelado em {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString('pt-BR') : '—'}.
          {order.cancelReason && <> Motivo: {order.cancelReason}</>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div className="admin-form-field" style={{ maxWidth: 300 }}>
          <label>Status do pedido</label>
          <select value={order.status} disabled={saving} onChange={(e) => changeStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {order.status === 'CANCELLED' && (
            <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Estoque das peças já foi devolvido automaticamente ao cancelar.
            </p>
          )}
        </div>

        <div className="admin-form-field" style={{ maxWidth: 300 }}>
          <label>Código de rastreio</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="ex: BR123456789BR"
            />
            <button className="admin-btn" onClick={saveTracking} disabled={saving}>
              {trackingSaved ? 'Salvo!' : 'Salvar'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            Exibido para o cliente em Minha Conta assim que preenchido.
          </p>
        </div>
      </div>

      <h3 style={{ fontSize: 15, marginTop: 24, marginBottom: 8 }}>Itens</h3>
      <table className="admin-table">
        <thead><tr><th>Produto</th><th>Qtd</th><th>Preço unit.</th><th>Subtotal</th></tr></thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id}>
              <td>{i.productName}</td>
              <td>{i.quantity}</td>
              <td>{formatPrice(i.unitPrice)}</td>
              <td>{formatPrice(Number(i.unitPrice) * i.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, maxWidth: 320 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><b>{formatPrice(order.subtotal)}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Frete ({order.shippingMethod})</span><b>{formatPrice(order.shippingPrice)}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Desconto</span><b>-{formatPrice(order.discountTotal)}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: 8, marginTop: 8 }}><span><b>Total</b></span><b>{formatPrice(order.total)}</b></div>
      </div>

      <h3 style={{ fontSize: 15, marginTop: 24, marginBottom: 8 }}>Pagamento</h3>
      {order.payment ? (
        <div>
          <p>Método: <b>{order.payment.method}</b> · Status: <span className={`admin-badge ${order.payment.status.toLowerCase()}`}>{order.payment.status}</span></p>
          {order.payment.providerPaymentId?.startsWith('SIMULADO') && (
            <p style={{ color: '#a4650e', fontSize: 13, marginTop: 8 }}>
              ⚠️ Pagamento em modo simulado — Mercado Pago ainda não configurado com credenciais reais.
            </p>
          )}
        </div>
      ) : (
        <p style={{ color: '#999' }}>Sem dados de pagamento.</p>
      )}

      <h3 style={{ fontSize: 15, marginTop: 24, marginBottom: 8 }}>Endereço de entrega</h3>
      <p>
        {order.shippingStreet}, {order.shippingNumber} {order.shippingComplement && `- ${order.shippingComplement}`}<br />
        {order.shippingNeighborhood} · {order.shippingCity}/{order.shippingState} · CEP {order.shippingZipCode}
      </p>
    </>
  );
}

'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/data';

export const STATUS_LABELS = {
  AWAITING_PAYMENT: { label: 'Aguardando pagamento', cls: 'shipped' },
  PAID: { label: 'Pago', cls: 'shipped' },
  PROCESSING: { label: 'Em preparação', cls: 'shipped' },
  SHIPPED: { label: 'Em trânsito', cls: 'shipped' },
  DELIVERED: { label: 'Entregue', cls: 'delivered' },
  CANCELLED: { label: 'Cancelado', cls: 'cancelled' },
};

export default function OrdersTab({ orders }) {
  return (
    <>
      <div className="dash-header">
        <span className="eyebrow">Minha Conta</span>
        <h2>Meus Pedidos</h2>
        <p style={{ color: 'var(--ink-500)', marginTop: 8 }}>
          Acompanhe suas compras e baixe os certificados de autenticidade.
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-500)' }}>
          <p>Você ainda não fez nenhum pedido.</p>
        </div>
      ) : (
        orders.map((o) => {
          const statusInfo = STATUS_LABELS[o.status] || { label: o.status, cls: '' };
          return (
            <div key={o.id} className="order-card">
              <div className="order-header">
                <div>
                  <div className="order-num">Pedido {o.orderNumber}</div>
                  <div className="order-date">Realizado em {new Date(o.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <span className={`order-status ${statusInfo.cls}`}>{statusInfo.label}</span>
              </div>
              <div className="order-items">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: 'var(--ink-800)', fontWeight: 500 }}>
                    {o.items.map((i) => i.productName).join(' · ')}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>
                    {o.items.length} {o.items.length === 1 ? 'peça' : 'peças'}
                  </div>
                </div>
              </div>
              <div className="order-footer">
                <div className="order-total">{formatPrice(o.total)}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/conta/pedidos/${o.id}`} className="btn btn-outline btn-sm">
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </div>
          );
        })
      )}

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link href="/catalogo" className="btn btn-primary btn-lg">Explorar mais peças</Link>
      </div>
    </>
  );
}

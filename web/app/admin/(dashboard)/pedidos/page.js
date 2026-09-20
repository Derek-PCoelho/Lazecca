'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/data';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <h1>Pedidos</h1>
      <p className="admin-sub">{orders.length} pedidos registrados.</p>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Total</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.orderNumber}</td>
                <td>{o.customerName}</td>
                <td>{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>{formatPrice(o.total)}</td>
                <td><span className={`admin-badge ${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</span></td>
                <td><span className={`admin-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                <td><Link href={`/admin/pedidos/${o.id}`} className="admin-btn outline">Ver</Link></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999' }}>Nenhum pedido ainda.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
}

import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [productCount, orderCount, messageCount, unreadMessages, revenueAgg, lowStockCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'APPROVED' } }),
    prisma.product.count({ where: { stock: { lte: 0 }, isActive: true, isSample: false } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <>
      <h1>Dashboard</h1>
      <p className="admin-sub">Visão geral da loja La Zecca Numismática.</p>

      <div className="admin-cards">
        <div className="admin-card">
          <div className="value">{productCount}</div>
          <div className="label">Produtos ativos</div>
        </div>
        <div className="admin-card">
          <div className="value">{orderCount}</div>
          <div className="label">Pedidos totais</div>
        </div>
        <div className="admin-card">
          <div className="value">{formatPrice(revenueAgg._sum.total || 0)}</div>
          <div className="label">Receita confirmada</div>
        </div>
        <div className="admin-card">
          <div className="value">{unreadMessages}</div>
          <div className="label">Mensagens não lidas ({messageCount} total)</div>
        </div>
        <div className="admin-card">
          <div className="value">{lowStockCount}</div>
          <div className="label">Peças esgotadas</div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Pedidos recentes</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Itens</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((o) => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{o.customerName}</td>
              <td>{o.items.length}</td>
              <td>{formatPrice(o.total)}</td>
              <td><span className={`admin-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
            </tr>
          ))}
          {recentOrders.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Nenhum pedido ainda.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

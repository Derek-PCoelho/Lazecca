import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminLogoutButton from '../AdminLogoutButton';
import '../admin.css';

// Layout do painel administrativo — protegido no servidor via getCurrentUser.
// Vive num route group "(dashboard)" para não afetar /admin/login (fora do
// grupo), evitando loop de redirecionamento.
export default async function AdminDashboardLayout({ children }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">LA ZECCA <span>Admin</span></div>
        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/produtos">Produtos</Link>
          <Link href="/admin/pedidos">Pedidos</Link>
          <Link href="/admin/mensagens">Mensagens</Link>
        </nav>
        <div className="admin-user">
          <div>{user.firstName} {user.lastName}</div>
          <div className="admin-user-email">{user.email}</div>
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

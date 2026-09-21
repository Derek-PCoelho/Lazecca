import { getCurrentUser } from '@/lib/auth';
import ChangePasswordForm from './ChangePasswordForm';

export const dynamic = 'force-dynamic';

// Meu Perfil (painel admin) — funcionalidade "Trocar senha" pedida pelo
// cliente. Reaproveita o mesmo endpoint PATCH /api/auth/profile já usado
// pela troca de senha da área de cliente (lib/auth.js verifica a senha
// atual e faz o hash bcrypt da nova) — a única diferença aqui é a UI, com
// as classes admin-* para manter a mesma identidade visual do resto do
// painel administrativo.
export default async function AdminProfilePage() {
  const user = await getCurrentUser();

  return (
    <>
      <h1>Meu Perfil</h1>
      <p className="admin-sub">Dados da conta administrativa e troca de senha.</p>

      <div className="admin-card" style={{ maxWidth: 480, marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: '#7a7168', marginBottom: 4 }}>Nome</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          {user.firstName} {user.lastName}
        </div>
        <div style={{ fontSize: 13, color: '#7a7168', marginBottom: 4 }}>E-mail de acesso</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{user.email}</div>
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Alterar senha</h2>
      <ChangePasswordForm />
    </>
  );
}

'use client';

export default function AdminLogoutButton() {
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };
  return (
    <button onClick={logout} className="admin-logout-btn">
      Sair
    </button>
  );
}

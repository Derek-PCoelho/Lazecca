'use client';

import { useState } from 'react';
import '../admin.css';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Funcionalidade: "Esqueci minha senha" do painel administrativo.
  // Reaproveita o mesmo endpoint /api/auth/forgot-password já usado pela
  // área de cliente (lib/mail.js + tabela password_reset_tokens), passando
  // context: 'admin' para que o link de redefinição gerado leve de volta
  // para /admin/login (ver app/redefinir-senha/ResetPasswordClient.js) e
  // para só considerar contas com role ADMIN elegíveis.
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível entrar.');
        return;
      }
      if (data.user.role !== 'ADMIN') {
        setError('Esta conta não tem acesso ao painel administrativo.');
        return;
      }
      window.location.href = '/admin';
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError('Digite seu e-mail no campo acima antes de clicar em "Esqueci minha senha".');
      return;
    }
    setError('');
    setForgotSubmitting(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, context: 'admin' }),
      });
      setForgotSent(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2 style={{ marginBottom: 4 }}>LA ZECCA</h2>
        <p style={{ color: '#7a7168', fontSize: 13, marginBottom: 24 }}>Painel Administrativo</p>
        {error && <p style={{ color: '#a12626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <form onSubmit={onSubmit}>
          <div className="admin-form-field">
            <label>E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="admin-form-field">
            <label>Senha</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}
              style={{ fontSize: 12, color: '#7a1f2b' }}
            >
              {forgotSubmitting
                ? 'Enviando...'
                : forgotSent
                  ? 'Link enviado! Verifique seu e-mail.'
                  : 'Esqueci minha senha'}
            </a>
          </div>
          <button className="admin-btn" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PasswordStrengthHints from '@/components/PasswordStrengthHints';
import { validatePasswordStrength } from '@/lib/validation';
// Página compartilhada por clientes (link vindo de /conta) E pelo painel
// administrativo (link vindo de /admin/login), diferenciados por ?admin=1
// no link de redefinição — mesmo endpoint (/api/auth/reset-password), só a
// aparência e o destino final do botão mudam.
import '@/app/admin/admin.css';

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const isAdmin = params.get('admin') === '1';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const check = validatePasswordStrength(password);
    if (!check.valid) {
      setError(`Senha não atende aos critérios: ${check.failures.join(' ')}`);
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível redefinir sua senha.');
        return;
      }
      setDone(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Versão para o painel administrativo: visual consistente com /admin/login
  // (cartão sobre fundo bordô), sem o Header/Footer da loja pública, e o
  // botão final leva de volta a /admin/login em vez de /conta.
  if (isAdmin) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h2 style={{ marginBottom: 4 }}>LA ZECCA</h2>
          <p style={{ color: '#7a7168', fontSize: 13, marginBottom: 24 }}>Redefinir senha do painel administrativo</p>

          {!token ? (
            <p style={{ fontSize: 14 }}>
              Link inválido ou incompleto. <Link href="/admin/login">Volte para o login</Link> e solicite um novo link.
            </p>
          ) : done ? (
            <div>
              <p style={{ fontSize: 14, marginBottom: 16, color: '#2e7d32' }}>Senha redefinida com sucesso!</p>
              <a href="/admin/login" className="admin-btn" style={{ width: '100%', textAlign: 'center' }}>Entrar agora</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <p style={{ color: '#a12626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <div className="admin-form-field">
                <label>Nova senha</label>
                <input type="password" required placeholder="Mínimo 12 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
                <PasswordStrengthHints password={password} />
              </div>
              <div className="admin-form-field">
                <label>Confirmar nova senha</label>
                <input type="password" required placeholder="Repita a nova senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <button className="admin-btn" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header page="account" />
      <div className="container" style={{ maxWidth: 480, padding: '64px 0' }}>
        <h1 className="h1" style={{ marginBottom: 16 }}>Redefinir senha</h1>

        {!token ? (
          <p>Link inválido. <Link href="/conta">Volte para Minha Conta</Link> e solicite um novo link.</p>
        ) : done ? (
          <div>
            <p style={{ marginBottom: 16 }}>Senha redefinida com sucesso!</p>
            <Link href="/conta" className="btn btn-primary btn-lg">Entrar agora</Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div className="field">
              <label>Nova senha</label>
              <input type="password" required placeholder="Mínimo 12 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
              <PasswordStrengthHints password={password} />
            </div>
            <div className="field">
              <label>Confirmar nova senha</label>
              <input type="password" required placeholder="Repita a nova senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}

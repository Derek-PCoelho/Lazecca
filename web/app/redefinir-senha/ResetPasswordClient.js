'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
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
              <input type="password" required placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
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

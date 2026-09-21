'use client';

import { useState } from 'react';
import PasswordStrengthHints from '@/components/PasswordStrengthHints';
import { validatePasswordStrength } from '@/lib/validation';

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.currentPassword) return setError('Informe sua senha atual.');
    const check = validatePasswordStrength(form.newPassword);
    if (!check.valid) return setError(`Nova senha não atende aos critérios: ${check.failures.join(' ')}`);
    if (form.newPassword !== form.confirmPassword) return setError('As senhas não coincidem.');

    setSubmitting(true);
    try {
      // Mesmo endpoint PATCH /api/auth/profile usado pela troca de senha na
      // área de cliente — funciona igual para admin, já que ambos são
      // apenas registros User (a diferença é só o campo role).
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível trocar a senha.');
        return;
      }
      setSuccess('Senha alterada com sucesso.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card" style={{ maxWidth: 480 }}>
      {error && <p style={{ color: '#a12626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: '#2e7d32', fontSize: 13, marginBottom: 12 }}>{success}</p>}

      <div className="admin-form-field">
        <label>Senha atual</label>
        <input
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
        />
      </div>
      <div className="admin-form-field">
        <label>Nova senha</label>
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
        />
        <PasswordStrengthHints password={form.newPassword} />
      </div>
      <div className="admin-form-field">
        <label>Confirmar nova senha</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
        />
      </div>
      <button className="admin-btn" disabled={submitting}>
        {submitting ? 'Salvando...' : 'Alterar senha'}
      </button>
    </form>
  );
}

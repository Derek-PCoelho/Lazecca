'use client';

import { useState } from 'react';
import PasswordStrengthHints from '@/components/PasswordStrengthHints';
import { formatCpf, formatPhone, validateCpf, validatePhone, validateFullName, validatePasswordStrength, onlyDigits } from '@/lib/validation';

// Bloco 1 — "Dados pessoais" e "Preferências de e-mail" apontavam para
// href="#". Uma única tela cobre ambos (mesma API PATCH /api/auth/profile),
// já que são o mesmo formulário de dados do usuário no backend.
export default function ProfileTab({ user, onUpdated }) {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone ? formatPhone(user.phone) : '',
    cpf: user.cpf ? formatCpf(user.cpf) : '',
    wantsNewsletter: !!user.wantsNewsletter,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [success, setSuccess] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const nameCheck = validateFullName(`${form.firstName} ${form.lastName}`);
    if (!nameCheck.valid) return setError(nameCheck.reason);

    if (form.cpf) {
      const cpfCheck = validateCpf(form.cpf);
      if (!cpfCheck.valid) return setError(cpfCheck.reason);
    }
    if (form.phone) {
      const phoneCheck = validatePhone(form.phone);
      if (!phoneCheck.valid) return setError(phoneCheck.reason);
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone ? onlyDigits(form.phone) : null,
          cpf: form.cpf ? onlyDigits(form.cpf) : null,
          wantsNewsletter: form.wantsNewsletter,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível salvar.');
        return;
      }
      setSuccess('Dados atualizados com sucesso.');
      onUpdated?.(data.user);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!pwForm.currentPassword) return setPwError('Informe sua senha atual.');
    const check = validatePasswordStrength(pwForm.newPassword);
    if (!check.valid) return setPwError(`Nova senha não atende aos critérios: ${check.failures.join(' ')}`);
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError('As senhas não coincidem.');

    setPwSubmitting(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || 'Não foi possível trocar a senha.');
        return;
      }
      setPwSuccess('Senha alterada com sucesso.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setPwError('Erro de conexão. Tente novamente.');
    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <>
      <div className="dash-header">
        <span className="eyebrow">Minha Conta</span>
        <h2>Dados Pessoais</h2>
        <p style={{ color: 'var(--ink-500)', marginTop: 8 }}>Atualize suas informações e preferências de contato.</p>
      </div>

      <form onSubmit={handleSaveProfile} className="card" style={{ padding: 24, marginBottom: 24 }}>
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: 'var(--success)', fontSize: 13, marginBottom: 12 }}>{success}</p>}

        <div className="field-row">
          <div className="field">
            <label>Nome</label>
            <input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
          </div>
          <div className="field">
            <label>Sobrenome</label>
            <input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>E-mail</label>
          <input value={user.email} disabled style={{ background: 'var(--cream)', cursor: 'not-allowed' }} />
          <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>O e-mail de login não pode ser alterado. Contate o suporte se precisar mudá-lo.</span>
        </div>
        <div className="field-row" style={{ marginTop: 12 }}>
          <div className="field">
            <label>CPF</label>
            <input
              value={form.cpf}
              onChange={(e) => setForm((f) => ({ ...f, cpf: formatCpf(e.target.value) }))}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="field">
            <label>Celular</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <h3 style={{ fontSize: 15, marginTop: 24, marginBottom: 8 }}>Preferências de e-mail</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={form.wantsNewsletter}
            onChange={(e) => setForm((f) => ({ ...f, wantsNewsletter: e.target.checked }))}
          />
          <label>Quero receber o Correio do Curador (newsletter semanal com novidades do acervo)</label>
        </div>

        <button className="btn btn-primary" type="submit" style={{ marginTop: 20 }} disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      <h3 style={{ fontSize: 16, marginBottom: 12 }}>Alterar senha</h3>
      <form onSubmit={handleChangePassword} className="card" style={{ padding: 24 }}>
        {pwError && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{pwError}</p>}
        {pwSuccess && <p style={{ color: 'var(--success)', fontSize: 13, marginBottom: 12 }}>{pwSuccess}</p>}

        <div className="field">
          <label>Senha atual</label>
          <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Nova senha</label>
          <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} />
          <PasswordStrengthHints password={pwForm.newPassword} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Confirmar nova senha</label>
          <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
        </div>
        <button className="btn btn-primary" type="submit" style={{ marginTop: 20 }} disabled={pwSubmitting}>
          {pwSubmitting ? 'Salvando...' : 'Alterar senha'}
        </button>
      </form>
    </>
  );
}

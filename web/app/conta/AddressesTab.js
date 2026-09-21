'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { formatCep, validateCepFormat, onlyDigits, lookupCep } from '@/lib/validation';

const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const EMPTY_FORM = {
  label: 'Principal', recipientName: '', street: '', number: '', complement: '',
  neighborhood: '', city: '', state: 'CE', zipCode: '', isDefault: false,
};

// Bloco 1 — "Endereços" apontava para href="#". CRUD real via /api/addresses,
// que já existia no backend (Fase 8/Bloco anterior) mas não tinha tela.
export default function AddressesTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = fechado, 'new' = criando, id = editando
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/addresses', { cache: 'no-store' });
      const data = await res.json();
      setAddresses(data.addresses || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setForm(EMPTY_FORM);
    setError('');
    setEditing('new');
  };

  const startEdit = (addr) => {
    setForm({
      label: addr.label, recipientName: addr.recipientName, street: addr.street,
      number: addr.number, complement: addr.complement || '', neighborhood: addr.neighborhood,
      city: addr.city, state: addr.state, zipCode: formatCep(addr.zipCode), isDefault: addr.isDefault,
    });
    setError('');
    setEditing(addr.id);
  };

  const cancelEdit = () => {
    setEditing(null);
    setError('');
  };

  const handleCepBlur = async () => {
    const check = validateCepFormat(form.zipCode);
    if (!check.valid) return;
    setCepLoading(true);
    const result = await lookupCep(form.zipCode);
    setCepLoading(false);
    if (result?.exists) {
      setForm((f) => ({
        ...f,
        street: result.street || f.street,
        neighborhood: result.neighborhood || f.neighborhood,
        city: result.city || f.city,
        state: result.state || f.state,
      }));
    } else if (result && !result.exists) {
      setError('CEP não encontrado. Verifique o número digitado.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.recipientName.trim()) return setError('Informe o nome do destinatário.');
    const cepCheck = validateCepFormat(form.zipCode);
    if (!cepCheck.valid) return setError(cepCheck.reason);
    if (!form.street.trim()) return setError('Informe a rua.');
    if (!form.number.trim()) return setError('Informe o número.');
    if (!form.neighborhood.trim()) return setError('Informe o bairro.');
    if (!form.city.trim()) return setError('Informe a cidade.');

    setSubmitting(true);
    try {
      const payload = { ...form, zipCode: onlyDigits(form.zipCode) };
      const isNew = editing === 'new';
      const res = await fetch(isNew ? '/api/addresses' : `/api/addresses/${editing}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível salvar o endereço.');
        return;
      }
      setEditing(null);
      await load();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover este endereço?')) return;
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
    await load();
  };

  const handleSetDefault = async (id) => {
    await fetch(`/api/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    });
    await load();
  };

  return (
    <>
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="eyebrow">Minha Conta</span>
          <h2>Endereços</h2>
          <p style={{ color: 'var(--ink-500)', marginTop: 8 }}>Gerencie seus endereços de entrega.</p>
        </div>
        {!editing && (
          <button className="btn btn-primary btn-sm" onClick={startNew}>
            <Icon name="plus" size={14} /> Novo endereço
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24, marginBottom: 24 }}>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div className="field-row">
            <div className="field">
              <label>Nome do destinatário</label>
              <input value={form.recipientName} onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))} />
            </div>
            <div className="field">
              <label>Rótulo (ex: Casa, Trabalho)</label>
              <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
          </div>
          <div className="field-row narrow-first">
            <div className="field">
              <label>CEP {cepLoading && '(buscando...)'}</label>
              <input
                value={form.zipCode}
                onChange={(e) => setForm((f) => ({ ...f, zipCode: formatCep(e.target.value) }))}
                onBlur={handleCepBlur}
                placeholder="00000-000"
              />
            </div>
            <div className="field">
              <label>Rua / Avenida</label>
              <input value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} />
            </div>
          </div>
          <div className="field-row narrow-first">
            <div className="field">
              <label>Número</label>
              <input value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} />
            </div>
            <div className="field">
              <label>Complemento</label>
              <input value={form.complement} onChange={(e) => setForm((f) => ({ ...f, complement: e.target.value }))} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Bairro</label>
              <input value={form.neighborhood} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} />
            </div>
            <div className="field">
              <label>Cidade</label>
              <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
          </div>
          <div className="field-row three">
            <div className="field">
              <label>Estado</label>
              <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}>
                {BR_STATES.map((uf) => <option key={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 16, fontSize: 13 }}>
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
            <label>Definir como endereço padrão</label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar endereço'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={cancelEdit}>Cancelar</button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p style={{ color: 'var(--ink-500)' }}>Carregando...</p>
      ) : addresses.length === 0 && !editing ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-500)' }}>
          <p>Nenhum endereço cadastrado ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {addresses.map((addr) => (
            <div key={addr.id} className="order-card" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ink-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {addr.label}
                  {addr.isDefault && <span className="order-status delivered" style={{ fontSize: 11 }}>Padrão</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>
                  {addr.recipientName}<br />
                  {addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}<br />
                  {addr.neighborhood} · {addr.city}/{addr.state} · CEP {formatCep(addr.zipCode)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                {!addr.isDefault && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleSetDefault(addr.id)}>Tornar padrão</button>
                )}
                <button className="btn btn-outline btn-sm" onClick={() => startEdit(addr)}>Editar</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(addr.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

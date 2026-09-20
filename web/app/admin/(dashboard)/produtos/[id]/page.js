'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminProductEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((data) => setProduct(data.product));
  }, [id]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive,
      }),
    });
    setSaving(false);
    setMsg(res.ok ? 'Salvo com sucesso!' : 'Erro ao salvar.');
  };

  if (!product) return <p>Carregando...</p>;

  return (
    <>
      <h1>Editar produto</h1>
      <p className="admin-sub">{product.legacyCode} · {product.slug}</p>

      <form onSubmit={save} style={{ maxWidth: 520 }}>
        <div className="admin-form-field">
          <label>Nome</label>
          <input value={product.name || ''} onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="admin-form-field">
          <label>Descrição</label>
          <textarea
            rows={5}
            value={product.description || ''}
            onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))}
          />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="admin-form-field" style={{ flex: 1 }}>
            <label>Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              value={product.price || ''}
              onChange={(e) => setProduct((p) => ({ ...p, price: e.target.value }))}
            />
          </div>
          <div className="admin-form-field" style={{ flex: 1 }}>
            <label>Estoque</label>
            <input
              type="number"
              value={product.stock ?? ''}
              onChange={(e) => setProduct((p) => ({ ...p, stock: e.target.value }))}
            />
          </div>
        </div>
        <div className="admin-form-field">
          <label>
            <input
              type="checkbox"
              checked={!!product.isActive}
              onChange={(e) => setProduct((p) => ({ ...p, isActive: e.target.checked }))}
              style={{ width: 'auto', marginRight: 8 }}
            />
            Ativo no catálogo
          </label>
        </div>
        {msg && <p style={{ color: msg.includes('sucesso') ? '#1e7a34' : '#a12626', marginBottom: 12 }}>{msg}</p>}
        <button className="admin-btn" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
        <button type="button" className="admin-btn outline" style={{ marginLeft: 8 }} onClick={() => router.push('/admin/produtos')}>
          Voltar
        </button>
      </form>
    </>
  );
}

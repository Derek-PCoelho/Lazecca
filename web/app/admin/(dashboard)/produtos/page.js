'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/data';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const load = async (query = '') => {
    setLoading(true);
    const res = await fetch(`/api/admin/products?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (p) => {
    if (!window.confirm(`Excluir permanentemente "${p.name}" (${p.legacyCode})? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setDeletingId(p.id);
    setError('');
    const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } else {
      setError(data.error || 'Erro ao excluir produto.');
    }
    setDeletingId(null);
  };

  return (
    <>
      <h1>Produtos</h1>
      <p className="admin-sub">{products.length} peças no catálogo.</p>

      {error && <p style={{ color: '#a12626', marginBottom: 12 }}>{error}</p>}

      <div className="admin-toolbar">
        <input
          placeholder="Buscar por nome ou código..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(q)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: 320 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin-btn outline" onClick={() => load(q)}>Buscar</button>
          <Link href="/admin/produtos/novo" className="admin-btn">+ Novo produto</Link>
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Ativo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.legacyCode}</td>
                <td>{p.name}</td>
                <td>{p.category?.name || '—'}</td>
                <td>{formatPrice(p.price)}</td>
                <td style={{ color: p.stock <= 0 ? '#a12626' : undefined }}>{p.stock}</td>
                <td>{p.isActive ? 'Sim' : 'Não'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/admin/produtos/${p.id}`} className="admin-btn outline">Editar</Link>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                    style={{
                      background: 'transparent',
                      border: '1px solid #a12626',
                      color: '#a12626',
                      padding: '6px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    {deletingId === p.id ? '...' : 'Excluir'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

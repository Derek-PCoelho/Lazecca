'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/data';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const load = async (query = '', cat = categoryId) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (cat) params.set('categoryId', cat);
    const res = await fetch(`/api/admin/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryId(value);
    load(q, value);
  };

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

  // Quando nenhuma categoria específica está selecionada, a lista (já vem
  // ordenada por categoria da API) é quebrada em grupos visuais com um
  // cabeçalho por categoria, evitando que o usuário tenha que rolar a lista
  // inteira por ID para achar um produto — ver pedido do cliente.
  const groups = [];
  if (!categoryId) {
    let currentKey = undefined;
    let currentGroup = null;
    for (const p of products) {
      const key = p.category?.id || 'none';
      if (key !== currentKey) {
        currentKey = key;
        currentGroup = { key, name: p.category?.name || 'Sem categoria', items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(p);
    }
  } else {
    groups.push({ key: categoryId, name: categories.find((c) => c.id === categoryId)?.name || '', items: products });
  }

  const renderRow = (p) => (
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
  );

  return (
    <>
      <h1>Produtos</h1>
      <p className="admin-sub">{products.length} peças no catálogo.</p>

      {error && <p style={{ color: '#a12626', marginBottom: 12 }}>{error}</p>}

      <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            placeholder="Buscar por nome ou código..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(q)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: 280 }}
          />
          <select
            value={categoryId}
            onChange={handleCategoryChange}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', minWidth: 200 }}
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="none">Sem categoria</option>
          </select>
          <button className="admin-btn outline" onClick={() => load(q)}>Buscar</button>
        </div>
        <Link href="/admin/produtos/novo" className="admin-btn">+ Novo produto</Link>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : products.length === 0 ? (
        <p className="admin-sub">Nenhum produto encontrado.</p>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {groups.map((group) => (
            <div key={group.key}>
              {!categoryId && (
                <h3
                  style={{
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#7a1f2b',
                    margin: '0 0 8px',
                  }}
                >
                  {group.name} <span style={{ color: '#9a9186', fontWeight: 400 }}>({group.items.length})</span>
                </h3>
              )}
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
                <tbody>{group.items.map(renderRow)}</tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

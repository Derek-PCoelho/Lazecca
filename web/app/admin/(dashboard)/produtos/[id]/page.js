'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductForm from '../ProductForm';
import ProductImagesManager from '../ProductImagesManager';

export default function AdminProductEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.product);
        setImages(data.product?.images || []);
      });
  }, [id]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsg('Salvo com sucesso!');
      setProduct(data.product);
    } else {
      setError(data.error || 'Erro ao salvar.');
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir permanentemente "${product.name}" (${product.legacyCode})? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }
    setDeleting(true);
    setError('');
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push('/admin/produtos');
    } else {
      setError(data.error || 'Erro ao excluir produto.');
      setDeleting(false);
    }
  };

  if (!product) return <p>Carregando...</p>;

  return (
    <>
      <h1>Editar produto</h1>
      <p className="admin-sub">{product.legacyCode} · {product.slug}</p>

      <h2 style={{ fontSize: 15, marginBottom: 8 }}>Fotos</h2>
      <div className="admin-card" style={{ maxWidth: 640, marginBottom: 24 }}>
        <ProductImagesManager productId={id} images={images} onChange={setImages} />
      </div>

      <h2 style={{ fontSize: 15, marginBottom: 8 }}>Dados do produto</h2>
      <form onSubmit={save} style={{ maxWidth: 640 }}>
        {msg && <p style={{ color: '#1e7a34', marginBottom: 12 }}>{msg}</p>}
        {error && <p style={{ color: '#a12626', marginBottom: 12 }}>{error}</p>}

        <ProductForm value={product} onChange={setProduct} />

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button className="admin-btn" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
            <button type="button" className="admin-btn outline" style={{ marginLeft: 8 }} onClick={() => router.push('/admin/produtos')}>
              Voltar
            </button>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'transparent',
              border: '1px solid #a12626',
              color: '#a12626',
              padding: '8px 16px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {deleting ? 'Excluindo...' : 'Excluir produto'}
          </button>
        </div>
      </form>
    </>
  );
}

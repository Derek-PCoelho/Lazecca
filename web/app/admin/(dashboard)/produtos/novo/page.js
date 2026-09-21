'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '../ProductForm';
import ProductImagesManager from '../ProductImagesManager';

const DEFAULT_PRODUCT = {
  name: '',
  description: '',
  history: '',
  price: '',
  priceOld: '',
  stock: 1,
  weightGrams: 50,
  isActive: true,
  isSample: false,
  quantidade: 1,
  isSequencia: false,
  seals: [],
  country: 'Brasil',
  countryCode: 'BR',
  weight: '—',
  diameter: '—',
  rarity: 'Regular',
};

export default function NewProductPage() {
  const router = useRouter();
  const [product, setProduct] = useState(DEFAULT_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState(null);
  const [images, setImages] = useState([]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!product.name?.trim()) {
      setError('Informe o nome do produto.');
      return;
    }
    if (product.price === '' || Number(product.price) < 0) {
      setError('Informe um preço válido.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao criar produto.');
        return;
      }
      setCreatedId(data.product.id);
      setProduct((p) => ({ ...p, legacyCode: data.product.legacyCode, slug: data.product.slug }));
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (createdId) {
    return (
      <>
        <h1>Produto criado</h1>
        <p className="admin-sub">
          {product.legacyCode} · {product.slug} — agora adicione as fotos do produto.
        </p>

        <div className="admin-card" style={{ maxWidth: 640, marginBottom: 24 }}>
          <ProductImagesManager productId={createdId} images={images} onChange={setImages} />
        </div>

        <button className="admin-btn" onClick={() => router.push(`/admin/produtos/${createdId}`)}>
          Ir para edição completa
        </button>
        <button
          type="button"
          className="admin-btn outline"
          style={{ marginLeft: 8 }}
          onClick={() => router.push('/admin/produtos')}
        >
          Voltar para a lista
        </button>
      </>
    );
  }

  return (
    <>
      <h1>Novo produto</h1>
      <p className="admin-sub">
        O código (Cxxxx) e o endereço (slug) são gerados automaticamente ao salvar. As fotos podem ser adicionadas na próxima tela.
      </p>

      <form onSubmit={handleCreate} style={{ maxWidth: 640 }}>
        {error && <p style={{ color: '#a12626', marginBottom: 12 }}>{error}</p>}

        <ProductForm value={product} onChange={setProduct} />

        <div style={{ marginTop: 24 }}>
          <button className="admin-btn" disabled={saving}>
            {saving ? 'Criando...' : 'Criar produto'}
          </button>
          <button
            type="button"
            className="admin-btn outline"
            style={{ marginLeft: 8 }}
            onClick={() => router.push('/admin/produtos')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}

'use client';

import { useRef, useState } from 'react';

// Gerenciador de imagens de um produto: upload (multipart), exclusão e
// reordenação (drag-and-drop simples via HTML5 DnD nativo, sem dependências
// externas). Usado tanto na página de criar quanto na de editar produto —
// só funciona depois que o produto já existe no banco (precisa de um id
// para associar as imagens), por isso na tela de criação o upload só fica
// disponível após salvar o produto pela primeira vez.
export default function ProductImagesManager({ productId, images: initialImages, onChange }) {
  const [images, setImages] = useState(initialImages || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const inputRef = useRef(null);

  const notify = (next) => {
    setImages(next);
    onChange?.(next);
  };

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setError('');
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          body: formData,
        });
        // eslint-disable-next-line no-await-in-loop
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erro ao enviar imagem.');
          continue;
        }
        notify([...images, data.image]);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Remover esta imagem?')) return;
    const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      notify(images.filter((img) => img.id !== imageId));
    } else {
      setError('Erro ao remover imagem.');
    }
  };

  const persistOrder = async (next) => {
    notify(next);
    await fetch(`/api/admin/products/${productId}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: next.map((img) => img.id) }),
    });
  };

  const handleDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = images.slice();
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    persistOrder(next);
  };

  return (
    <div>
      {error && <p style={{ color: '#a12626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {images.map((img, idx) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => setDragIndex(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            style={{
              position: 'relative',
              width: 120,
              height: 120,
              border: '1px solid #ddd',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#f7f5f2',
              cursor: 'grab',
            }}
            title="Arraste para reordenar"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/${img.url}`}
              alt={img.altText || ''}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {idx === 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  background: '#7a1f2b',
                  color: 'white',
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                Capa
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              title="Remover imagem"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: 'rgba(122,31,43,0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 22,
                height: 22,
                cursor: 'pointer',
                fontSize: 13,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}

        <label
          style={{
            width: 120,
            height: 120,
            border: '1px dashed #999',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 4,
            fontSize: 12,
            color: '#7a7168',
            cursor: 'pointer',
            textAlign: 'center',
            padding: 8,
          }}
        >
          {uploading ? 'Enviando...' : '+ Adicionar foto'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>
      <p style={{ fontSize: 12, color: '#7a7168' }}>
        JPG, PNG ou WEBP, até 8MB cada. A primeira foto da lista é usada como capa no catálogo — arraste para reordenar.
      </p>
    </div>
  );
}

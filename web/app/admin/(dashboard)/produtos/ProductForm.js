'use client';

import { useEffect, useState } from 'react';

// Escala de conservação numismática tradicional (cédulas: FE/SOB/MBC/BC —
// ver texto explicativo em app/produto/[slug]/ProductClient.js, aba "Estado
// de Conservação"). Mantido aqui como opções sugeridas no <select>, mas o
// campo aceita texto livre (algumas peças usam a escala Sheldon 1-70 para
// moedas internacionais).
const STATE_OPTIONS = [
  { short: 'FE', full: 'Flor de Estampa', label: 'Estado de emissão, sem circulação' },
  { short: 'SOB', full: 'Soberba', label: 'Circulação mínima, excelente estado' },
  { short: 'MBC', full: 'Muito Bem Conservada', label: 'Circulação moderada, bom estado geral' },
  { short: 'BC', full: 'Bem Conservada', label: 'Circulação visível, desgaste perceptível' },
];

function Field({ label, children, hint }) {
  return (
    <div className="admin-form-field">
      <label>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#9a9186', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// Formulário completo com todos os campos editáveis de um Product (schema
// Prisma) — usado tanto na criação quanto na edição. `value`/`onChange`
// seguem o padrão de estado controlado (o pai guarda o objeto do produto).
export default function ProductForm({ value, onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const set = (field) => (e) => {
    const v = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    onChange({ ...value, [field]: v });
  };

  const setState = (opt) => {
    onChange({
      ...value,
      state: opt.short,
      stateShort: opt.short,
      stateFull: opt.full,
      stateLabel: opt.label,
    });
  };

  const sealsArr = Array.isArray(value.seals) ? value.seals : [];
  const toggleSeal = (seal) => {
    const next = sealsArr.includes(seal) ? sealsArr.filter((s) => s !== seal) : [...sealsArr, seal];
    onChange({ ...value, seals: next });
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* --- Identificação básica --- */}
      <section>
        <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7a1f2b', marginBottom: 12 }}>
          Identificação
        </h3>
        <Field label="Nome *">
          <input value={value.name || ''} onChange={set('name')} />
        </Field>
        <div style={{ display: 'flex', gap: 16 }}>
          <Field label="Categoria" hint="Cédulas Brasileiras, Moedas Brasileiras, Moedas Estrangeiras, Acessórios...">
            <select value={value.categoryId || ''} onChange={set('categoryId')} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}>
              <option value="">— Sem categoria —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Referência de catálogo" hint="Ex.: código do catálogo Krause/Yeoman">
            <input value={value.catalogReference || ''} onChange={set('catalogReference')} />
          </Field>
        </div>
        <Field label="Descrição">
          <textarea rows={4} value={value.description || ''} onChange={set('description')} />
        </Field>
        <Field label="Contexto histórico" hint="Exibido na aba 'Contexto Histórico' da página do produto">
          <textarea rows={4} value={value.history || ''} onChange={set('history')} />
        </Field>
      </section>

      {/* --- Preço e estoque --- */}
      <section>
        <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7a1f2b', marginBottom: 12 }}>
          Preço e estoque
        </h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <Field label="Preço (R$) *" hint="Usado no PIX (5% off) e parcelamento">
            <input type="number" step="0.01" value={value.price ?? ''} onChange={set('price')} />
          </Field>
          <Field label="Preço antigo (R$)" hint="Opcional — exibido cortado, indicando desconto">
            <input type="number" step="0.01" value={value.priceOld ?? ''} onChange={set('priceOld')} />
          </Field>
          <Field label="Estoque">
            <input type="number" value={value.stock ?? ''} onChange={set('stock')} />
          </Field>
          <Field label="Peso p/ frete (g)">
            <input type="number" value={value.weightGrams ?? ''} onChange={set('weightGrams')} />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={!!value.isActive} onChange={set('isActive')} style={{ width: 'auto' }} />
            Ativo no catálogo
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={!!value.isSample} onChange={set('isSample')} style={{ width: 'auto' }} />
            Item de demonstração (isSample)
          </label>
        </div>
      </section>

      {/* --- Ficha numismática --- */}
      <section>
        <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7a1f2b', marginBottom: 12 }}>
          Ficha numismática
        </h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <Field label="Denominação" hint="Ex.: 1 Cruzeiro, 500 Réis">
            <input value={value.denomination || ''} onChange={set('denomination')} />
          </Field>
          <Field label="Ano">
            <input type="number" value={value.year ?? ''} onChange={set('year')} />
          </Field>
          <Field label="Período">
            <input value={value.periodo || ''} onChange={set('periodo')} />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Field label="Padrão monetário">
            <input value={value.padrao || ''} onChange={set('padrao')} />
          </Field>
          <Field label="Estampa / família">
            <input value={value.estampa || ''} onChange={set('estampa')} />
          </Field>
          <Field label="Série">
            <input value={value.serie || ''} onChange={set('serie')} />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Field label="Figura / retrato histórico">
            <input value={value.figura || ''} onChange={set('figura')} />
          </Field>
          <Field label="Assinaturas / chancelas">
            <input value={value.assinaturas || ''} onChange={set('assinaturas')} />
          </Field>
          <Field label="Variedade" hint='Ex.: "Autografada" habilita selo especial'>
            <input value={value.variedade || ''} onChange={set('variedade')} />
          </Field>
        </div>
      </section>

      {/* --- País e material --- */}
      <section>
        <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7a1f2b', marginBottom: 12 }}>
          País e material
        </h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <Field label="País">
            <input value={value.country || ''} onChange={set('country')} />
          </Field>
          <Field label="Código do país" hint="Ex.: BR, US, DE">
            <input value={value.countryCode || ''} onChange={set('countryCode')} />
          </Field>
          <Field label="Metal / material">
            <input value={value.metal || ''} onChange={set('metal')} />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Field label="Peso (texto exibido)" hint='Ex.: "8,5g" — deixe "—" se não aplicável'>
            <input value={value.weight || ''} onChange={set('weight')} />
          </Field>
          <Field label="Dimensões" hint='Ex.: "155 x 65mm" — deixe "—" se não aplicável'>
            <input value={value.diameter || ''} onChange={set('diameter')} />
          </Field>
        </div>
      </section>

      {/* --- Estado de conservação --- */}
      <section>
        <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7a1f2b', marginBottom: 12 }}>
          Estado de conservação
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {STATE_OPTIONS.map((opt) => (
            <button
              key={opt.short}
              type="button"
              onClick={() => setState(opt)}
              className={value.stateShort === opt.short ? 'admin-btn' : 'admin-btn outline'}
              style={{ fontSize: 12 }}
            >
              {opt.short} · {opt.full}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Field label="Sigla do estado" hint="Preenchido ao clicar num botão acima, ou edite livremente">
            <input value={value.stateShort || ''} onChange={set('stateShort')} />
          </Field>
          <Field label="Nome completo do estado">
            <input value={value.stateFull || ''} onChange={set('stateFull')} />
          </Field>
        </div>
        <Field label="Descrição do grau">
          <input value={value.stateLabel || ''} onChange={set('stateLabel')} />
        </Field>
        <Field label="Defeitos observados" hint="Exibido na aba 'Estado de Conservação' da página do produto">
          <textarea rows={2} value={value.defeitos || ''} onChange={set('defeitos')} />
        </Field>
        <Field label="Raridade" hint='Ex.: "Regular", "Rara", "Muito Rara"'>
          <input value={value.rarity || ''} onChange={set('rarity')} />
        </Field>
      </section>

      {/* --- Lote e selos --- */}
      <section>
        <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7a1f2b', marginBottom: 12 }}>
          Lote / sequência e selos
        </h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <Field label="Quantidade de exemplares">
            <input type="number" min={1} value={value.quantidade ?? 1} onChange={set('quantidade')} />
          </Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginTop: 24 }}>
            <input type="checkbox" checked={!!value.isSequencia} onChange={set('isSequencia')} style={{ width: 'auto' }} />
            É uma sequência (números seguidos)
          </label>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={sealsArr.includes('rare')} onChange={() => toggleSeal('rare')} style={{ width: 'auto' }} />
            Selo &quot;Rara&quot;
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={sealsArr.includes('authenticated')} onChange={() => toggleSeal('authenticated')} style={{ width: 'auto' }} />
            Selo &quot;Autenticada&quot;
          </label>
        </div>
      </section>

      {/* --- Extras / envio --- */}
      <section>
        <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7a1f2b', marginBottom: 12 }}>
          Extras
        </h3>
        <Field label="Certificado" hint="Texto livre sobre certificado de autenticidade, se houver">
          <input value={value.certificate || ''} onChange={set('certificate')} />
        </Field>
        <Field label="Texto de envio" hint='Ex.: "Frete R$ 24,90" — exibido na página do produto'>
          <input value={value.shipping || ''} onChange={set('shipping')} />
        </Field>
        <Field label="Observações do curador" hint="Exibido em destaque na aba 'Descrição'">
          <textarea rows={3} value={value.observacoes || ''} onChange={set('observacoes')} />
        </Field>
      </section>
    </div>
  );
}

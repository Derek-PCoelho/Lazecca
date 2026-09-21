// =============================================================================
// Utilitários compartilhados pelos endpoints de admin de produtos
// (app/api/admin/products/route.js e app/api/admin/products/[id]/route.js)
// =============================================================================

export const ALLOWED_PRODUCT_FIELDS = [
  'name', 'description', 'history',
  'catalogReference', 'padrao', 'denomination', 'year', 'periodo', 'figura',
  'estampa', 'serie', 'assinaturas', 'variedade', 'defeitos', 'observacoes',
  'country', 'countryCode', 'metal', 'weight', 'diameter',
  'state', 'stateShort', 'stateFull', 'stateLabel',
  'seals', 'rarity', 'certificate', 'shipping',
  'quantidade', 'isSequencia',
  'price', 'priceOld', 'stock', 'weightGrams',
  'isSample', 'isActive', 'categoryId',
];

export function coerceProductData(body) {
  const data = {};
  for (const f of ALLOWED_PRODUCT_FIELDS) {
    if (body[f] === undefined) continue;
    let v = body[f];
    if (['price', 'priceOld'].includes(f)) {
      v = v === '' || v === null ? null : Number(v);
    } else if (['stock', 'weightGrams', 'year', 'quantidade'].includes(f)) {
      v = v === '' || v === null || v === undefined ? null : parseInt(v, 10);
    } else if (['isSequencia', 'isSample', 'isActive'].includes(f)) {
      v = !!v;
    } else if (f === 'seals') {
      v = Array.isArray(v) ? v : [];
    } else if (f === 'categoryId') {
      v = v || null;
    } else if (typeof v === 'string') {
      v = v.trim() === '' ? null : v;
    }
    data[f] = v;
  }
  return data;
}

export function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Gera o próximo código legado sequencial no formato Cxxxx (ex.: C0001, C0140),
// olhando o maior número já usado no banco (independente de ter sido criado
// pelo seed original ou por este endpoint).
export async function nextLegacyCode(prisma) {
  const rows = await prisma.product.findMany({
    where: { legacyCode: { startsWith: 'C' } },
    select: { legacyCode: true },
  });
  let max = 0;
  for (const r of rows) {
    const m = /^C(\d+)$/.exec(r.legacyCode || '');
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `C${String(max + 1).padStart(4, '0')}`;
}

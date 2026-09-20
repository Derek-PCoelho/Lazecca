// =============================================================================
// Script de seed — popula o banco de dados MySQL real com:
//   - 4 categorias (idênticas ao protótipo)
//   - 139 produtos (135 cédulas reais + 4 amostras isSample=true)
//   - 10 posts do blog (Diário do Curador)
//   - reviews de exemplo (já existiam como demonstração no protótipo)
//   - usuário admin inicial (para o painel administrativo, Fase 7)
//
// Fonte dos dados: web/data/*.json, já gerados a partir de
// design_files/data/data.js + design_files/data/cadastro-v2.xlsx (ver
// data-quality-log.md para as correções aplicadas).
//
// Uso: node prisma/seed.js
// =============================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const products = require('../data/products.json');
const categories = require('../data/categories.json');
const postContents = require('../data/blog-contents.json');
const postsIndex = require('../data/posts.json');
const reviews = require('../data/reviews.json');

async function main() {
  console.log('🌱 Iniciando seed do banco de dados La Zecca Numismática...\n');

  // --- 1. Categorias ---
  console.log('📂 Criando categorias...');
  const categoryMap = {};
  for (const [i, cat] of categories.entries()) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon || null, sortOrder: i },
      create: {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon || null,
        sortOrder: i,
      },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`   ✅ ${categories.length} categorias criadas/atualizadas.\n`);

  // --- 2. Produtos ---
  console.log('🪙 Criando produtos (135 cédulas reais + 4 amostras)...');
  let realCount = 0;
  let sampleCount = 0;
  for (const p of products) {
    const categoryId = categoryMap[p.category] || null;

    const data = {
      slug: p.slug,
      name: p.name,
      description: p.description || null,
      history: p.history || null,
      catalogReference: p.referenciaCatalogo || null,
      padrao: p.padrao || null,
      denomination: p.denomination || null,
      year: typeof p.year === 'number' ? p.year : null,
      periodo: p.periodo || null,
      figura: p.figura || null,
      estampa: p.estampa || null,
      serie: p.serie || null,
      assinaturas: p.assinaturas || null,
      variedade: p.variedade || null,
      defeitos: p.defeitos || null,
      observacoes: p.observacoes || null,
      country: p.country || 'Brasil',
      countryCode: p.countryCode || 'BR',
      metal: p.metal || null,
      weight: p.weight || '—',
      diameter: p.diameter || '—',
      state: p.state || null,
      stateShort: p.stateShort || null,
      stateFull: p.stateFull || null,
      stateLabel: p.stateLabel || null,
      seals: p.seals || [],
      rarity: p.rarity || 'Regular',
      certificate: p.certificate || null,
      shipping: p.shipping || null,
      quantidade: p.quantidade || 1,
      isSequencia: !!p.isSequencia,
      price: p.price,
      priceOld: p.priceOld ?? null,
      stock: p.stock ?? p.quantidade ?? 0,
      isSample: !!p.isSample,
      isActive: true,
      categoryId,
    };

    const product = await prisma.product.upsert({
      where: { legacyCode: p.id },
      update: data,
      create: { legacyCode: p.id, ...data },
    });

    // Imagens do produto (array `images`, preservando ordem)
    const imgs = Array.isArray(p.images) && p.images.length ? p.images : [p.image].filter(Boolean);
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (const [idx, url] of imgs.entries()) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: url.replace(/^\/+/, ''),
          altText: p.name,
          sortOrder: idx,
        },
      });
    }

    if (p.isSample) sampleCount++;
    else realCount++;
  }
  console.log(`   ✅ ${realCount} produtos reais + ${sampleCount} amostras (isSample) criados.\n`);

  // --- 3. Posts do blog ---
  console.log('📰 Criando posts do Diário do Curador...');
  let postCount = 0;
  for (const [i, meta] of postsIndex.entries()) {
    const contentHtml = postContents[meta.slug] || `<p>${meta.excerpt || ''}</p>`;
    await prisma.post.upsert({
      where: { slug: meta.slug },
      update: {
        title: meta.title,
        excerpt: meta.excerpt || null,
        contentHtml,
        coverImage: meta.cover ? meta.cover.replace(/^\/+/, '') : null,
        category: meta.category || null,
        author: meta.author || 'Dr. Sergio Costa',
        readTime: meta.readTime || null,
        displayDate: meta.date || null,
        sortOrder: i,
      },
      create: {
        slug: meta.slug,
        title: meta.title,
        excerpt: meta.excerpt || null,
        contentHtml,
        coverImage: meta.cover ? meta.cover.replace(/^\/+/, '') : null,
        category: meta.category || null,
        author: meta.author || 'Dr. Sergio Costa',
        readTime: meta.readTime || null,
        displayDate: meta.date || null,
        sortOrder: i,
      },
    });
    postCount++;
  }
  console.log(`   ✅ ${postCount} posts criados/atualizados.\n`);

  // --- 4. Reviews de exemplo ---
  console.log('⭐ Criando reviews de exemplo...');
  const existingReviews = await prisma.review.count();
  let reviewCount = 0;
  if (existingReviews === 0 && Array.isArray(reviews)) {
    for (const r of reviews) {
      await prisma.review.create({
        data: {
          authorName: r.author || r.name || 'Cliente Lazecca',
          authorCity: r.city || null,
          rating: r.rating || 5,
          title: r.title || null,
          comment: r.text || r.comment || '',
          displayDate: r.date || null,
        },
      });
      reviewCount++;
    }
  }
  console.log(`   ✅ ${reviewCount} reviews criados (${existingReviews} já existiam).\n`);

  // --- 5. Usuário admin inicial (painel administrativo, Fase 7) ---
  console.log('👤 Criando usuário administrador inicial...');
  const adminEmail = process.env.ADMIN_EMAIL || 'lazecca80@gmail.com';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'TrocarEstaSenha#2026';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Sergio',
      lastName: 'Costa',
      role: 'ADMIN',
    },
  });
  console.log(`   ✅ Admin criado: ${adminEmail} (senha inicial definida via ADMIN_INITIAL_PASSWORD — troque no primeiro login!)\n`);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { coerceProductData, slugify, nextLegacyCode } from '@/lib/adminProduct';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const where = {};
  if (q) {
    where.OR = [{ name: { contains: q } }, { legacyCode: { contains: q } }, { slug: { contains: q } }];
  }
  if (categoryId) {
    where.categoryId = categoryId === 'none' ? null : categoryId;
  }

  // Ordenado por categoria (sortOrder da própria categoria) e, dentro dela,
  // por legacyCode decrescente (mais recentes primeiro) — permite que a tela
  // de admin agrupe visualmente por categoria em vez da lista plana por ID.
  const products = await prisma.product.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: { category: true, images: true },
    orderBy: [{ category: { sortOrder: 'asc' } }, { legacyCode: 'desc' }],
    take: 500,
  });
  return NextResponse.json({ products });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: 'Nome do produto é obrigatório.' }, { status: 400 });
    }

    const legacyCode = await nextLegacyCode(prisma);
    const baseSlug = slugify(body.name) || legacyCode.toLowerCase();
    let slug = baseSlug;
    let i = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const data = coerceProductData(body);
    data.price = data.price ?? 0;
    data.stock = data.stock ?? 0;

    const product = await prisma.product.create({
      data: { legacyCode, slug, ...data },
      include: { category: true, images: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('[api/admin/products POST]', err);
    return NextResponse.json({ error: 'Erro ao criar produto.' }, { status: 500 });
  }
}

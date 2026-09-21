import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function mapFavorite(f) {
  const p = f.product;
  const images = (p.images || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: f.id,
    productId: p.id,
    legacyCode: p.legacyCode,
    slug: p.slug,
    name: p.name,
    image: images[0]?.url || null,
    price: Number(p.price),
    stock: p.stock,
    categoryName: p.category?.name || null,
    year: p.year,
    state: p.state,
    createdAt: f.createdAt,
  };
}

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ favorites: [], error: auth.error }, { status: auth.status });

  const favorites = await prisma.favorite.findMany({
    where: { userId: auth.user.id },
    include: { product: { include: { images: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ favorites: favorites.map(mapFavorite) });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { productId } = (await request.json()) || {};
    if (!productId) return NextResponse.json({ error: 'productId é obrigatório.' }, { status: 400 });

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { legacyCode: productId }] },
    });
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

    await prisma.favorite.upsert({
      where: { userId_productId: { userId: auth.user.id, productId: product.id } },
      update: {},
      create: { userId: auth.user.id, productId: product.id },
    });
    return NextResponse.json({ ok: true, favorited: true });
  } catch (err) {
    console.error('[api/favorites POST]', err);
    return NextResponse.json({ error: 'Erro ao favoritar.' }, { status: 500 });
  }
}

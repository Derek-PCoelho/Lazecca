import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const product = await prisma.product.findFirst({
    where: { OR: [{ id: params.productId }, { legacyCode: params.productId }] },
  });
  if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

  await prisma.favorite.deleteMany({ where: { userId: auth.user.id, productId: product.id } });
  return NextResponse.json({ ok: true, favorited: false });
}

export async function GET(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ favorited: false, error: auth.error }, { status: auth.status });

  const product = await prisma.product.findFirst({
    where: { OR: [{ id: params.productId }, { legacyCode: params.productId }] },
  });
  if (!product) return NextResponse.json({ favorited: false });

  const fav = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: auth.user.id, productId: product.id } },
  });
  return NextResponse.json({ favorited: !!fav });
}

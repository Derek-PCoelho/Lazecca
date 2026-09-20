import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  const products = await prisma.product.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { legacyCode: { contains: q } }, { slug: { contains: q } }] }
      : undefined,
    include: { category: true, images: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ products });
}

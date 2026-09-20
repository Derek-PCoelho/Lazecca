import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, images: true },
  });
  if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const allowedFields = ['name', 'description', 'price', 'stock', 'isActive', 'isSample', 'categoryId'];
    const data = {};
    for (const f of allowedFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);

    const product = await prisma.product.update({ where: { id: params.id }, data });
    return NextResponse.json({ product });
  } catch (err) {
    console.error('[api/admin/products/:id PATCH]', err);
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 });
  }
}

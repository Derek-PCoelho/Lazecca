import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, payment: true, user: true },
  });
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { status } = (await request.json()) || {};
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }
  const order = await prisma.order.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json({ order });
}

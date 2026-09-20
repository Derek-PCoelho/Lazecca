import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, payment: true },
  });
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  // Só o dono do pedido (ou admin) pode ver detalhes
  if (order.userId && (!user || (user.id !== order.userId && user.role !== 'ADMIN'))) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }
  return NextResponse.json({ order });
}

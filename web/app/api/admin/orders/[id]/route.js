import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export async function GET(request, { params }) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, user: true },
  });
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  return NextResponse.json({ order });
}

// Bloco 1/8 — além de trocar status, o admin agora pode registrar o código de
// rastreio (exibido ao cliente em /conta/pedidos/[id]) e cancelar o pedido
// pelo painel (devolvendo estoque das peças, igual ao fluxo do cliente).
export async function PATCH(request, { params }) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await request.json()) || {};
  const { status, trackingCode, cancelReason } = body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id }, include: { items: true, payment: true } });
  if (!existing) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });

  const data = {};
  if (trackingCode !== undefined) data.trackingCode = trackingCode || null;

  const isCancelling = status === 'CANCELLED' && existing.status !== 'CANCELLED';

  if (isCancelling) {
    const wasPaid = existing.status === 'PAID' || existing.status === 'PROCESSING' || existing.status === 'SHIPPED';
    const order = await prisma.$transaction(async (tx) => {
      for (const item of existing.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
      const result = await tx.order.update({
        where: { id },
        data: {
          ...data,
          status: 'CANCELLED',
          cancelReason: cancelReason || 'Cancelado pelo administrador.',
          cancelledAt: new Date(),
          paymentStatus: wasPaid ? 'REFUNDED' : existing.paymentStatus,
        },
      });
      if (existing.payment) {
        await tx.payment.update({ where: { orderId: id }, data: { status: wasPaid ? 'REFUNDED' : existing.payment.status } });
      }
      return result;
    });
    return NextResponse.json({ order });
  }

  if (status !== undefined) data.status = status;
  const order = await prisma.order.update({ where: { id }, data });
  return NextResponse.json({ order });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// =============================================================================
// Bloco 4 — Liberação automática de estoque reservado (pedidos abandonados)
// =============================================================================
// Como o estoque é debitado no momento em que o pedido é CRIADO (garantindo
// que a peça fique "reservada" para quem está pagando — ver Bloco 4 no
// /api/orders POST), pedidos cujo pagamento NUNCA é confirmado (cliente
// fecha a aba, PIX expira em 30min, boleto expira em 3 dias) prendem
// estoque de peças únicas indefinidamente se nada liberar depois.
//
// Esta rota varre pedidos AWAITING_PAYMENT cujo prazo de pagamento
// (Payment.pixExpiresAt / boletoExpiresAt) já passou, devolve o estoque de
// cada item e marca o pedido como CANCELLED com motivo automático.
//
// Deve ser chamada periodicamente por um CRON job (ex: cron do Hostinger
// batendo nesta URL a cada 10-15 minutos) — protegida por um header secreto
// (CRON_SECRET) para não poder ser disparada por qualquer visitante.
// =============================================================================

export async function POST(request) {
  const secret = request.headers.get('x-cron-secret');
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET não configurado no servidor.' }, { status: 500 });
  }
  if (secret !== expected) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const now = new Date();

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'AWAITING_PAYMENT',
      payment: {
        is: {
          OR: [
            { pixExpiresAt: { lt: now } },
            { boletoExpiresAt: { lt: now } },
          ],
        },
      },
    },
    include: { items: true, payment: true },
  });

  let releasedCount = 0;
  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancelReason: 'Pagamento não confirmado dentro do prazo — estoque liberado automaticamente.',
          cancelledAt: now,
        },
      });
      if (order.payment) {
        await tx.payment.update({ where: { orderId: order.id }, data: { status: 'REJECTED' } });
      }
    });
    releasedCount += 1;
  }

  return NextResponse.json({ ok: true, releasedCount, checkedAt: now.toISOString() });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Bloco 8 — Cancelamento de pedido pelo cliente.
// Regras de negócio:
//  - Só o dono do pedido pode cancelar (admin cancela pelo painel /admin).
//  - Só pedidos ainda não enviados podem ser cancelados pelo cliente
//    (AWAITING_PAYMENT, PAID, PROCESSING) — depois de SHIPPED/DELIVERED,
//    o cliente precisa contatar o suporte (peça já em trânsito/entregue).
//  - Direito de arrependimento (Art. 49 CDC): compra online pode ser
//    cancelada em até 7 dias corridos da confirmação, sem necessidade de
//    justificativa. Mantemos essa janela como limite também para pedidos
//    já processados (não só aguardando pagamento).
//  - Estoque das peças é devolvido automaticamente (são peças únicas de
//    numismática — sem devolver o estoque, a peça ficaria "perdida" do
//    catálogo indevidamente).
//  - Reembolso real via Mercado Pago só quando a integração for ativada
//    (fora de escopo por ora) — por enquanto, o status interno já fica
//    pronto: paymentStatus vira REFUNDED quando o pedido já estava pago,
//    documentando a intenção; o operador financeiro executa o estorno real
//    manualmente até a integração ser ligada.

const REGRET_PERIOD_DAYS = 7;
const CANCELLABLE_STATUSES = ['AWAITING_PAYMENT', 'PAID', 'PROCESSING'];

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true },
  });
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  if (order.userId !== user.id) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  if (order.status === 'CANCELLED') {
    return NextResponse.json({ error: 'Este pedido já está cancelado.' }, { status: 409 });
  }
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json(
      { error: 'Este pedido já foi enviado/entregue e não pode mais ser cancelado por aqui. Entre em contato com o suporte.' },
      { status: 409 }
    );
  }

  const daysSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceOrder > REGRET_PERIOD_DAYS) {
    return NextResponse.json(
      { error: `O prazo de ${REGRET_PERIOD_DAYS} dias para cancelamento pelo site já passou. Entre em contato com o suporte.` },
      { status: 409 }
    );
  }

  const { reason } = (await request.json().catch(() => ({}))) || {};
  const wasPaid = order.status === 'PAID' || order.status === 'PROCESSING';

  const updated = await prisma.$transaction(async (tx) => {
    // Devolve o estoque de cada item — peças únicas retornam ao catálogo público
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    const result = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason || 'Cancelado pelo cliente (direito de arrependimento).',
        cancelledAt: new Date(),
        paymentStatus: wasPaid ? 'REFUNDED' : order.paymentStatus,
      },
    });

    if (order.payment) {
      await tx.payment.update({
        where: { orderId: order.id },
        data: { status: wasPaid ? 'REFUNDED' : order.payment.status },
      });
    }

    return result;
  });

  return NextResponse.json({ ok: true, order: updated });
}

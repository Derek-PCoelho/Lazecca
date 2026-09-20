import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentStatus, mapMpStatusToInternal, isConfigured } from '@/lib/mercadopago';

export const dynamic = 'force-dynamic';

// Webhook do Mercado Pago (Checkout Transparente) — PRÉ-IMPLEMENTADO.
// Enquanto MERCADOPAGO_ACCESS_TOKEN não estiver configurado, esta rota apenas
// responde 200 sem processar nada (o Mercado Pago ainda não está enviando
// notificações reais). Após configurar as credenciais e apontar a URL de
// webhook no painel do Mercado Pago para
// https://lazecca.com.br/api/checkout/mercadopago/webhook, os pagamentos
// passam a ser confirmados automaticamente aqui.
export async function POST(request) {
  if (!isConfigured()) {
    return NextResponse.json({ ok: true, simulated: true });
  }

  try {
    const body = await request.json();
    const paymentId = body?.data?.id || body?.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    const { status, rawResponse } = await getPaymentStatus(paymentId);
    const { paymentStatus, orderStatus } = mapMpStatusToInternal(status);

    const payment = await prisma.payment.findFirst({ where: { providerPaymentId: String(paymentId) } });
    if (!payment) return NextResponse.json({ ok: true });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: paymentStatus, rawResponse: rawResponse || undefined },
    });
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus, status: orderStatus },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[webhook/mercadopago]', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

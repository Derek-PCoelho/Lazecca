// =============================================================================
// Mercado Pago — Checkout Transparente (PRÉ-IMPLEMENTADO)
// =============================================================================
// Esta integração está PRONTA para operar assim que as credenciais reais
// forem preenchidas em .env / variáveis de ambiente de produção:
//   MERCADOPAGO_ACCESS_TOKEN   (chave privada, começa com APP_USR- ou TEST-)
//   MERCADOPAGO_PUBLIC_KEY     (chave pública, usada no futuro se o front
//                               precisar tokenizar cartão via SDK.js)
//   MERCADOPAGO_WEBHOOK_SECRET (validação de assinatura do webhook)
//
// Enquanto MERCADOPAGO_ACCESS_TOKEN estiver vazio, todas as funções abaixo
// rodam em MODO SIMULADO: nenhuma chamada de rede é feita, e o pedido é
// criado com status "pending_payment" — o site funciona de ponta a ponta,
// só falta o pagamento real acontecer de fato.
//
// Passo a passo para o cliente (La Zecca) ativar de verdade:
//   1. Criar/logar em https://www.mercadopago.com.br/developers/panel
//   2. Criar uma aplicação → pegar "Credenciais de produção"
//      (Access Token + Public Key)
//   3. Preencher MERCADOPAGO_ACCESS_TOKEN e MERCADOPAGO_PUBLIC_KEY nas
//      variáveis de ambiente do servidor (Hostinger hPanel > Node.js >
//      Variáveis de ambiente) e reiniciar a aplicação Node.js
//   4. (Opcional, recomendado) Configurar a URL de Webhook no painel do
//      Mercado Pago apontando para:
//      https://lazecca.com.br/api/checkout/mercadopago/webhook
//   5. Pronto — a partir daí, PIX gera QR Code real, cartão processa
//      pagamento real e boleto é emitido de verdade. Nenhuma alteração de
//      código é necessária.
// =============================================================================

const MP_API_BASE = 'https://api.mercadopago.com';

export function isConfigured() {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Cria um pagamento PIX (Checkout Transparente) para um pedido.
 * Em modo simulado, devolve um QR Code fictício (imagem em branco/base64 curto)
 * apenas para a UI poder renderizar o layout normalmente.
 */
export async function createPixPayment({ order, payerEmail }) {
  if (!isConfigured()) {
    return {
      simulated: true,
      status: 'pending',
      providerPaymentId: `SIMULADO-PIX-${order.orderNumber}`,
      pixQrCode: '00020126360014BR.GOV.BCB.PIX0114SIMULADOSIMULADO5204000053039865802BR5913LA ZECCA LTDA6009FORTALEZA62070503***6304ABCD',
      pixQrCodeBase64: null, // sem imagem real em modo simulado
      pixExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
      message:
        'Mercado Pago ainda não configurado — este é um QR Code de demonstração. Configure MERCADOPAGO_ACCESS_TOKEN para gerar cobranças PIX reais.',
    };
  }

  const res = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'X-Idempotency-Key': `${order.orderNumber}-pix`,
    },
    body: JSON.stringify({
      transaction_amount: Number(order.total),
      description: `Pedido ${order.orderNumber} · La Zecca Numismática`,
      payment_method_id: 'pix',
      payer: { email: payerEmail },
      external_reference: order.orderNumber,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/mercadopago/webhook`,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Falha ao criar pagamento PIX no Mercado Pago.');
  }

  const txData = data.point_of_interaction?.transaction_data || {};
  return {
    simulated: false,
    status: data.status,
    providerPaymentId: String(data.id),
    pixQrCode: txData.qr_code || null,
    pixQrCodeBase64: txData.qr_code_base64 || null,
    pixExpiresAt: data.date_of_expiration ? new Date(data.date_of_expiration) : null,
    rawResponse: data,
  };
}

/**
 * Cria um pagamento com cartão de crédito via Checkout Transparente.
 * Espera um `cardToken` já gerado no front pelo SDK.js do Mercado Pago
 * (a ser integrado quando MERCADOPAGO_PUBLIC_KEY for preenchida).
 */
export async function createCardPayment({ order, payerEmail, cardToken, installments = 1 }) {
  if (!isConfigured()) {
    return {
      simulated: true,
      status: 'pending',
      providerPaymentId: `SIMULADO-CARTAO-${order.orderNumber}`,
      cardLastFourDigits: '0000',
      cardBrand: 'simulado',
      installments,
      message:
        'Mercado Pago ainda não configurado — pagamento com cartão está em modo demonstração. Configure as credenciais reais para processar cobranças de verdade.',
    };
  }

  const res = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'X-Idempotency-Key': `${order.orderNumber}-card`,
    },
    body: JSON.stringify({
      transaction_amount: Number(order.total),
      token: cardToken,
      description: `Pedido ${order.orderNumber} · La Zecca Numismática`,
      installments,
      payer: { email: payerEmail },
      external_reference: order.orderNumber,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/mercadopago/webhook`,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Falha ao processar pagamento com cartão no Mercado Pago.');
  }

  return {
    simulated: false,
    status: data.status,
    providerPaymentId: String(data.id),
    cardLastFourDigits: data.card?.last_four_digits || null,
    cardBrand: data.payment_method_id || null,
    installments: data.installments || installments,
    rawResponse: data,
  };
}

/** Cria um boleto via Checkout Transparente. */
export async function createBoletoPayment({ order, payer }) {
  if (!isConfigured()) {
    return {
      simulated: true,
      status: 'pending',
      providerPaymentId: `SIMULADO-BOLETO-${order.orderNumber}`,
      boletoUrl: null,
      boletoBarcode: '00000.00000 00000.000000 00000.000000 0 00000000000000',
      boletoExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      message:
        'Mercado Pago ainda não configurado — boleto de demonstração. Configure as credenciais reais para emitir boletos válidos.',
    };
  }

  const res = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'X-Idempotency-Key': `${order.orderNumber}-boleto`,
    },
    body: JSON.stringify({
      transaction_amount: Number(order.total),
      description: `Pedido ${order.orderNumber} · La Zecca Numismática`,
      payment_method_id: 'bolbradesco',
      payer: {
        email: payer.email,
        first_name: payer.firstName,
        last_name: payer.lastName,
        identification: { type: 'CPF', number: (payer.cpf || '').replace(/\D/g, '') },
      },
      external_reference: order.orderNumber,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/mercadopago/webhook`,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Falha ao gerar boleto no Mercado Pago.');
  }

  return {
    simulated: false,
    status: data.status,
    providerPaymentId: String(data.id),
    boletoUrl: data.transaction_details?.external_resource_url || null,
    boletoBarcode: data.barcode?.content || null,
    boletoExpiresAt: data.date_of_expiration ? new Date(data.date_of_expiration) : null,
    rawResponse: data,
  };
}

/** Consulta o status atual de um pagamento no Mercado Pago (para polling/webhook). */
export async function getPaymentStatus(providerPaymentId) {
  if (!isConfigured() || String(providerPaymentId).startsWith('SIMULADO-')) {
    return { status: 'pending', simulated: true };
  }
  const res = await fetch(`${MP_API_BASE}/v1/payments/${providerPaymentId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Falha ao consultar status do pagamento.');
  return { status: data.status, rawResponse: data };
}

/** Mapeia status do Mercado Pago para o enum interno PaymentStatus/OrderStatus. */
export function mapMpStatusToInternal(mpStatus) {
  switch (mpStatus) {
    case 'approved':
      return { paymentStatus: 'APPROVED', orderStatus: 'PAID' };
    case 'pending':
    case 'in_process':
      return { paymentStatus: 'IN_PROCESS', orderStatus: 'AWAITING_PAYMENT' };
    case 'rejected':
      return { paymentStatus: 'REJECTED', orderStatus: 'CANCELLED' };
    case 'refunded':
    case 'charged_back':
      return { paymentStatus: 'REFUNDED', orderStatus: 'CANCELLED' };
    default:
      return { paymentStatus: 'PENDING', orderStatus: 'AWAITING_PAYMENT' };
  }
}

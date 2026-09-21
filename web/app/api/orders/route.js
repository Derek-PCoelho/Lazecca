import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateActiveCart, clearCart } from '@/lib/cartServer';
import { calculateShippingOptions } from '@/lib/shipping';
import { createPixPayment, createCardPayment, createBoletoPayment } from '@/lib/mercadopago';
import { sendOrderConfirmationEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

const PIX_DISCOUNT_RATE = 0.05;

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 89999);
  return `LZ-${year}-${rand}`;
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: { select: { slug: true, certificate: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } } } } }, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ orders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, address, shippingMethod, paymentMethod, cardToken, installments } = body || {};

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'É necessário estar logado para finalizar a compra.' }, { status: 401 });
    }

    if (!customer?.name || !customer?.email || !address?.zipCode) {
      return NextResponse.json({ error: 'Dados de identificação/entrega incompletos.' }, { status: 400 });
    }

    const { cart } = await getOrCreateActiveCart();

    if (!cart) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    // Revalida estoque no momento da compra (Melhoria 13 — nunca confiar só no client)
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        return NextResponse.json(
          {
            error: `"${item.product.name}" tem apenas ${item.product.stock} unidade(s) em estoque. Ajuste seu carrinho.`,
          },
          { status: 409 }
        );
      }
    }

    const subtotal = cartItems.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);

    const shippingOptions = await calculateShippingOptions({
      cepDestino: (address.zipCode || '').replace(/\D/g, ''),
      items: cartItems.map((i) => ({ weightGrams: i.product.weightGrams, quantity: i.quantity })),
      subtotal,
    });
    const chosenShipping =
      shippingOptions.find((o) => o.id === shippingMethod) || shippingOptions[0] || { price: 0 };

    const discountTotal = paymentMethod === 'pix' ? subtotal * PIX_DISCOUNT_RATE : 0;
    const total = subtotal + chosenShipping.price - discountTotal;

    const orderNumber = generateOrderNumber();

    // Cria pedido + itens + baixa de estoque em transação atômica
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id || null,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone || null,
          customerCpf: customer.cpf || null,
          shippingStreet: address.street || null,
          shippingNumber: address.number || null,
          shippingComplement: address.complement || null,
          shippingNeighborhood: address.neighborhood || null,
          shippingCity: address.city || null,
          shippingState: address.state || null,
          shippingZipCode: address.zipCode || null,
          subtotal,
          shippingMethod: shippingMethod || 'pac',
          shippingPrice: chosenShipping.price,
          discountTotal,
          total,
          paymentMethod: paymentMethod || 'pix',
          items: {
            create: cartItems.map((i) => ({
              productId: i.productId,
              productName: i.product.name,
              unitPrice: i.product.price,
              quantity: i.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Baixa de estoque (Melhoria 13 — agora reforçada no servidor)
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Esvazia o carrinho
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    // Pagamento (Checkout Transparente — pré-implementado, roda em modo
    // simulado até MERCADOPAGO_ACCESS_TOKEN ser configurado)
    let paymentResult;
    try {
      if (paymentMethod === 'card') {
        paymentResult = await createCardPayment({
          order,
          payerEmail: customer.email,
          cardToken,
          installments: installments || 1,
        });
      } else if (paymentMethod === 'boleto') {
        paymentResult = await createBoletoPayment({
          order,
          payer: {
            email: customer.email,
            firstName: customer.name.split(' ')[0],
            lastName: customer.name.split(' ').slice(1).join(' ') || customer.name,
            cpf: customer.cpf,
          },
        });
      } else {
        paymentResult = await createPixPayment({ order, payerEmail: customer.email });
      }
    } catch (payErr) {
      console.error('[api/orders] Falha no gateway de pagamento:', payErr.message);
      paymentResult = { simulated: true, status: 'pending', providerPaymentId: `ERRO-${orderNumber}` };
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod || 'pix',
        provider: 'mercadopago',
        providerPaymentId: paymentResult.providerPaymentId || null,
        status: 'PENDING',
        pixQrCode: paymentResult.pixQrCode || null,
        pixQrCodeBase64: paymentResult.pixQrCodeBase64 || null,
        pixExpiresAt: paymentResult.pixExpiresAt || null,
        boletoUrl: paymentResult.boletoUrl || null,
        boletoBarcode: paymentResult.boletoBarcode || null,
        boletoExpiresAt: paymentResult.boletoExpiresAt || null,
        cardLastFourDigits: paymentResult.cardLastFourDigits || null,
        cardBrand: paymentResult.cardBrand || null,
        installments: paymentResult.installments || 1,
        rawResponse: paymentResult.rawResponse || null,
      },
    });

    // E-mail de confirmação (não bloqueia a resposta em caso de falha)
    sendOrderConfirmationEmail(order).catch((e) => console.error('[mail] falha ao enviar confirmação:', e));

    return NextResponse.json({
      order: { ...order, total, subtotal, shippingPrice: chosenShipping.price, discountTotal },
      payment: paymentResult,
    });
  } catch (err) {
    console.error('[api/orders POST]', err);
    return NextResponse.json({ error: 'Erro interno ao processar o pedido.' }, { status: 500 });
  }
}

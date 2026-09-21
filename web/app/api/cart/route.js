import { NextResponse } from 'next/server';
import { getCartItems, addToCart, clearCart } from '@/lib/cartServer';

export const dynamic = 'force-dynamic';

// Carrinho de convidado (a pedido do cliente): visitante sem login pode
// montar o carrinho normalmente. Login só é exigido para PROSSEGUIR COM A
// COMPRA (ver POST /api/orders) — não para ver/editar o carrinho.
export async function GET() {
  const items = await getCartItems();
  return NextResponse.json({ items });
}

export async function POST(request) {
  try {
    const { productId, qty } = (await request.json()) || {};
    if (!productId) {
      return NextResponse.json({ ok: false, reason: 'missing-product' }, { status: 400 });
    }
    const result = await addToCart(productId, qty || 1);
    if (!result.ok) return NextResponse.json(result, { status: 409 });
    const items = await getCartItems();
    return NextResponse.json({ ...result, items });
  } catch (err) {
    console.error('[api/cart POST]', err);
    return NextResponse.json({ ok: false, reason: 'server-error' }, { status: 500 });
  }
}

export async function DELETE() {
  await clearCart();
  return NextResponse.json({ ok: true });
}

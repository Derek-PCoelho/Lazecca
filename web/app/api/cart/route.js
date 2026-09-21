import { NextResponse } from 'next/server';
import { getCartItems, addToCart, clearCart } from '@/lib/cartServer';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Carrinho exige login (loja virtual de verdade — sem carrinho de convidado).
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ items: [], error: auth.error }, { status: auth.status });
  const items = await getCartItems();
  return NextResponse.json({ items });
}

export async function POST(request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return NextResponse.json({ ok: false, reason: 'auth-required', error: auth.error }, { status: auth.status });

    const { productId, qty } = (await request.json()) || {};
    if (!productId) {
      return NextResponse.json({ ok: false, reason: 'missing-product' }, { status: 400 });
    }
    const result = await addToCart(productId, qty || 1);
    if (!result.ok) return NextResponse.json(result, { status: result.reason === 'auth-required' ? 401 : 409 });
    const items = await getCartItems();
    return NextResponse.json({ ...result, items });
  } catch (err) {
    console.error('[api/cart POST]', err);
    return NextResponse.json({ ok: false, reason: 'server-error' }, { status: 500 });
  }
}

export async function DELETE() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  await clearCart();
  return NextResponse.json({ ok: true });
}

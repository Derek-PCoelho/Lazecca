import { NextResponse } from 'next/server';
import { updateCartItemQty, removeCartItem, getCartItems } from '@/lib/cartServer';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

    const { qty } = (await request.json()) || {};
    const result = await updateCartItemQty(params.itemId, Number(qty));
    const items = await getCartItems();
    if (!result.ok) return NextResponse.json({ ...result, items }, { status: 409 });
    return NextResponse.json({ ...result, items });
  } catch (err) {
    console.error('[api/cart/:id PATCH]', err);
    return NextResponse.json({ ok: false, reason: 'server-error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  await removeCartItem(params.itemId);
  const items = await getCartItems();
  return NextResponse.json({ ok: true, items });
}

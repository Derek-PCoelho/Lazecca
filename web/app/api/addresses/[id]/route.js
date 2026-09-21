import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function assertOwnership(userId, id) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) return null;
  return address;
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const existing = await assertOwnership(auth.user.id, id);
  if (!existing) return NextResponse.json({ error: 'Endereço não encontrado.' }, { status: 404 });

  try {
    const body = await request.json();
    const allowed = ['label', 'recipientName', 'street', 'number', 'complement', 'neighborhood', 'city', 'state', 'zipCode', 'isDefault'];
    const data = {};
    for (const f of allowed) {
      if (body[f] !== undefined) data[f] = f === 'zipCode' ? String(body[f]).replace(/\D/g, '') : body[f];
    }

    if (data.isDefault === true) {
      await prisma.address.updateMany({ where: { userId: auth.user.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.update({ where: { id }, data });
    return NextResponse.json({ address });
  } catch (err) {
    console.error('[api/addresses/:id PATCH]', err);
    return NextResponse.json({ error: 'Erro ao atualizar endereço.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const existing = await assertOwnership(auth.user.id, id);
  if (!existing) return NextResponse.json({ error: 'Endereço não encontrado.' }, { status: 404 });

  await prisma.address.delete({ where: { id } });

  // Se apagou o endereço padrão e ainda restam outros, promove o mais recente.
  if (existing.isDefault) {
    const remaining = await prisma.address.findFirst({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
    });
    if (remaining) {
      await prisma.address.update({ where: { id: remaining.id }, data: { isDefault: true } });
    }
  }

  return NextResponse.json({ ok: true });
}

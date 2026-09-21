import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ addresses: [], error: auth.error }, { status: auth.status });

  const addresses = await prisma.address.findMany({
    where: { userId: auth.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { label, recipientName, street, number, complement, neighborhood, city, state, zipCode, isDefault } = body || {};

    if (!recipientName || !street || !number || !neighborhood || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios do endereço.' }, { status: 400 });
    }

    const existingCount = await prisma.address.count({ where: { userId: auth.user.id } });
    const makeDefault = !!isDefault || existingCount === 0;

    if (makeDefault) {
      await prisma.address.updateMany({ where: { userId: auth.user.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.create({
      data: {
        userId: auth.user.id,
        label: label || 'Principal',
        recipientName,
        street,
        number,
        complement: complement || null,
        neighborhood,
        city,
        state,
        zipCode: String(zipCode).replace(/\D/g, ''),
        isDefault: makeDefault,
      },
    });
    return NextResponse.json({ address });
  } catch (err) {
    console.error('[api/addresses POST]', err);
    return NextResponse.json({ error: 'Erro ao salvar endereço.' }, { status: 500 });
  }
}

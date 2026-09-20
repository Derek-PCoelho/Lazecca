import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { isRead } = (await request.json()) || {};
  const message = await prisma.contactMessage.update({
    where: { id: params.id },
    data: { isRead: !!isRead },
  });
  return NextResponse.json({ message });
}

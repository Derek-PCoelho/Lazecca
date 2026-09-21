import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Lista simples de categorias com `id` (a rota pública /api/categories não
// expõe o id, só slug/name, pois é usada para navegação/filtros do site;
// aqui o admin precisa do id para preencher o <select> de categoria do
// produto).
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, slug: true, name: true },
  });
  return NextResponse.json({ categories });
}

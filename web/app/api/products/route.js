import { NextResponse } from 'next/server';
import { getVisibleProducts, getCategories, getFiltros } from '@/lib/data';

// Retorna todo o catálogo visível + categorias + filtros calculados, num único
// payload — consumido por app/catalogo/CatalogClient.js e app/page.js no
// carregamento inicial (client components não podem chamar Prisma direto).
export async function GET() {
  const [products, categories, filtros] = await Promise.all([
    getVisibleProducts(),
    getCategories(),
    getFiltros(),
  ]);
  return NextResponse.json({ products, categories, filtros });
}

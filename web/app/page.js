import { getCategories } from '@/lib/data';
import HomeClient from './HomeClient';

// Força renderização dinâmica (sem cache estático de build) — os dados vêm do
// banco real e podem mudar a qualquer momento via painel administrativo.
export const dynamic = 'force-dynamic';

// Server Component: busca categorias reais do banco (Prisma) e repassa como
// props para o client component (que cuida das animações de reveal).
export default async function HomePage() {
  const categories = await getCategories();
  return <HomeClient categories={categories} />;
}

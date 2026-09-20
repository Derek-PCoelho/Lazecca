// =============================================================================
// Cliente Prisma singleton
// =============================================================================
// Em desenvolvimento, o Next.js recarrega módulos a cada mudança de arquivo
// (hot reload), o que criaria uma nova instância do PrismaClient a cada vez
// e esgotaria as conexões do MySQL. O padrão abaixo (guardar a instância em
// `globalThis`) é a prática recomendada pela documentação oficial do Prisma
// para uso com Next.js.
// =============================================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

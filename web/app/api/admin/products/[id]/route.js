import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { coerceProductData } from '@/lib/adminProduct';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const data = coerceProductData(body);

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
    });
    return NextResponse.json({ product });
  } catch (err) {
    console.error('[api/admin/products/:id PATCH]', err);
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 });
  }
}

// Remove o produto e, quando possível, os arquivos de imagem que foram
// enviados via upload do admin (pasta public/assets/products/uploads/) —
// imagens do acervo original (fora dessa pasta) NÃO são apagadas do disco,
// apenas o registro no banco (evita apagar assets compartilhados por engano).
export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    });
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

    // Bloqueia exclusão se o produto já tiver sido vendido (existe em algum
    // pedido) — apagar quebraria o histórico de pedidos (OrderItem.productId
    // é obrigatório e não tem onDelete: Cascade). Nesses casos, orientamos a
    // apenas desativar o produto (isActive=false) em vez de excluir.
    const orderItemCount = await prisma.orderItem.count({ where: { productId: params.id } });
    if (orderItemCount > 0) {
      return NextResponse.json(
        {
          error:
            'Este produto já foi vendido (aparece em pedidos) e não pode ser excluído, para preservar o histórico. Desative-o em vez de excluir.',
        },
        { status: 409 }
      );
    }

    for (const img of product.images) {
      if (img.url && img.url.startsWith('assets/products/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', img.url);
        // eslint-disable-next-line no-await-in-loop
        await fs.unlink(filePath).catch(() => {});
      }
    }

    // CartItem e Review referenciam o produto sem onDelete: Cascade no
    // schema (para não apagar avaliações/histórico de carrinho por acidente
    // em operações comuns) — aqui, ao excluir de fato o produto, removemos
    // os itens de carrinho pendentes que o referenciam (não afeta pedidos já
    // fechados, que usam OrderItem, bloqueado acima) e desvinculamos reviews
    // (mantidas como depoimento genérico, sem productId).
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: params.id } }),
      prisma.review.updateMany({ where: { productId: params.id }, data: { productId: null } }),
      prisma.product.delete({ where: { id: params.id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/products/:id DELETE]', err);
    return NextResponse.json({ error: 'Erro ao excluir produto.' }, { status: 500 });
  }
}

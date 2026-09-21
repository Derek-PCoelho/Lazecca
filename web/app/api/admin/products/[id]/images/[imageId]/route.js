import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// DELETE — remove uma imagem específica do produto. Se o arquivo estiver na
// pasta de uploads do admin, também remove o arquivo físico do disco.
export async function DELETE(request, { params }) {
  const { id, imageId } = await params;
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image || image.productId !== id) {
      return NextResponse.json({ error: 'Imagem não encontrada.' }, { status: 404 });
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    if (image.url && image.url.startsWith('assets/products/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', image.url);
      await fs.unlink(filePath).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/products/:id/images/:imageId DELETE]', err);
    return NextResponse.json({ error: 'Erro ao remover imagem.' }, { status: 500 });
  }
}

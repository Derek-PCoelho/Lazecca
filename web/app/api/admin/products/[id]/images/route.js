import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'assets', 'products', 'uploads');
const PUBLIC_PREFIX = 'assets/products/uploads';
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_SIZE = 8 * 1024 * 1024; // 8MB por imagem

// GET — lista imagens do produto (ordenadas)
export async function GET(request, { params }) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const images = await prisma.productImage.findMany({
    where: { productId: id },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json({ images });
}

// POST — upload de uma nova imagem (multipart/form-data, campo "file")
export async function POST(request, { params }) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Formato não suportado. Envie JPG, PNG ou WEBP.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Imagem muito grande (máximo 8MB).' }, { status: 400 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const filename = `${product.legacyCode.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const maxSort = await prisma.productImage.aggregate({
      where: { productId: id },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        url: `${PUBLIC_PREFIX}/${filename}`,
        altText: product.name,
        sortOrder,
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (err) {
    console.error('[api/admin/products/:id/images POST]', err);
    return NextResponse.json({ error: 'Erro ao enviar imagem.' }, { status: 500 });
  }
}

// PATCH — reordena as imagens do produto. Body: { order: [imageId, imageId, ...] }
export async function PATCH(request, { params }) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const order = Array.isArray(body.order) ? body.order : [];
    if (!order.length) return NextResponse.json({ error: 'Ordem inválida.' }, { status: 400 });

    await prisma.$transaction(
      order.map((imageId, idx) =>
        prisma.productImage.update({
          where: { id: imageId },
          data: { sortOrder: idx },
        })
      )
    );

    const images = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ images });
  } catch (err) {
    console.error('[api/admin/products/:id/images PATCH]', err);
    return NextResponse.json({ error: 'Erro ao reordenar imagens.' }, { status: 500 });
  }
}

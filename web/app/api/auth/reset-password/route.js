import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { token, password } = (await request.json()) || {};
    if (!token || !password) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 8 caracteres.' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Link de redefinição inválido ou expirado. Solicite um novo.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/auth/reset-password]', err);
    return NextResponse.json({ error: 'Erro interno ao redefinir senha.' }, { status: 500 });
  }
}

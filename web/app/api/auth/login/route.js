import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signSession, setSessionCookie } from '@/lib/auth';
import { mergeGuestCartIntoUser } from '@/lib/cartServer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, password } = (await request.json()) || {};
    if (!email || !password) {
      return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const token = signSession(user);
    await setSessionCookie(token);
    await mergeGuestCartIntoUser(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch (err) {
    console.error('[api/auth/login]', err);
    return NextResponse.json({ error: 'Erro interno ao entrar.' }, { status: 500 });
  }
}

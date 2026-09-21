import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signSession, setSessionCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { mergeGuestCartIntoUser } from '@/lib/cartServer';

export const dynamic = 'force-dynamic';

// Bloco 5 — Rate limiting: no máximo 10 tentativas de login por IP a cada 15
// minutos, para dificultar ataques de força bruta/credential stuffing.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`login:${ip}`, { windowMs: LOGIN_WINDOW_MS, max: LOGIN_MAX_ATTEMPTS });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

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

    // Migra o carrinho de convidado (se existir) para o carrinho deste
    // usuário agora que a sessão está ativa — ver lib/cartServer.js.
    await mergeGuestCartIntoUser(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch (err) {
    console.error('[api/auth/login]', err);
    return NextResponse.json({ error: 'Erro interno ao entrar.' }, { status: 500 });
  }
}

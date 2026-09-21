import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

// Bloco 5 — Rate limiting: no máximo 5 pedidos de redefinição por IP a cada
// hora, para evitar abuso do envio de e-mails (spam / enumeração de contas).
const FORGOT_WINDOW_MS = 60 * 60 * 1000;
const FORGOT_MAX_ATTEMPTS = 5;

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`forgot-password:${ip}`, { windowMs: FORGOT_WINDOW_MS, max: FORGOT_MAX_ATTEMPTS });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas solicitações. Tente novamente mais tarde.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }

    const { email } = (await request.json()) || {};
    if (!email) {
      return NextResponse.json({ error: 'Informe seu e-mail.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });

    // Sempre responde OK (mesmo se o e-mail não existir) para não vazar quais
    // e-mails estão cadastrados — comportamento padrão de segurança em lojas virtuais.
    if (user && user.isActive) {
      const token = randomUUID();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br';
      const resetUrl = `${siteUrl}/redefinir-senha?token=${token}`;

      await sendMail({
        to: user.email,
        subject: 'Redefinição de senha · La Zecca Numismática',
        html: `
          <h2>Olá, ${user.firstName}!</h2>
          <p>Recebemos um pedido para redefinir a senha da sua conta na La Zecca Numismática.</p>
          <p><a href="${resetUrl}">Clique aqui para escolher uma nova senha</a> (o link expira em 1 hora).</p>
          <p>Se você não pediu essa redefinição, pode ignorar este e-mail com segurança.</p>
          <p>— Equipe La Zecca Numismática</p>
        `,
        text: `Redefina sua senha em: ${resetUrl} (expira em 1 hora)`,
      });
    }

    return NextResponse.json({ ok: true, message: 'Se este e-mail estiver cadastrado, você receberá um link de redefinição em instantes.' });
  } catch (err) {
    console.error('[api/auth/forgot-password]', err);
    return NextResponse.json({ error: 'Erro interno ao processar solicitação.' }, { status: 500 });
  }
}

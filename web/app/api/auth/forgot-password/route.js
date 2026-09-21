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

    const { email, context } = (await request.json()) || {};
    if (!email) {
      return NextResponse.json({ error: 'Informe seu e-mail.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });

    // "Esqueci minha senha" do painel admin (context === 'admin') só deve
    // gerar link de redefinição se a conta realmente for ADMIN — evita que
    // alguém descubra, pela ausência/presença do e-mail "enviado", se um
    // determinado e-mail de cliente existe testando pela tela de admin
    // (mesma resposta genérica é sempre devolvida, então isso é só para não
    // mandar e-mail de redefinição de admin para uma conta de cliente comum).
    const isAdminContext = context === 'admin';
    const eligible = user && user.isActive && (!isAdminContext || user.role === 'ADMIN');

    // Sempre responde OK (mesmo se o e-mail não existir) para não vazar quais
    // e-mails estão cadastrados — comportamento padrão de segurança em lojas virtuais.
    if (eligible) {
      const token = randomUUID();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br';
      const resetPath = isAdminContext ? '/redefinir-senha?admin=1&token=' : '/redefinir-senha?token=';
      const resetUrl = `${siteUrl}${resetPath}${token}`;

      const contextLabel = isAdminContext ? 'do painel administrativo' : 'da sua conta';
      await sendMail({
        to: user.email,
        subject: 'Redefinição de senha · La Zecca Numismática',
        html: `
          <h2>Olá, ${user.firstName}!</h2>
          <p>Recebemos um pedido para redefinir a senha ${contextLabel} na La Zecca Numismática.</p>
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

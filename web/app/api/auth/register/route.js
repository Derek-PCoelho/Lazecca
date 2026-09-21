import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signSession, setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, cpf, phone, wantsNewsletter } = body || {};

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Preencha nome, sobrenome, e-mail e senha.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 8 caracteres.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: 'Já existe uma conta com este e-mail.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName,
        lastName,
        cpf: cpf || null,
        phone: phone || null,
        wantsNewsletter: !!wantsNewsletter,
      },
    });

    const token = signSession(user);
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch (err) {
    console.error('[api/auth/register]', err);
    return NextResponse.json({ error: 'Erro interno ao criar conta.' }, { status: 500 });
  }
}

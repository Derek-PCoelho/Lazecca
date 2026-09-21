import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signSession, setSessionCookie } from '@/lib/auth';
import {
  validateFullName,
  validateEmail,
  validatePasswordStrength,
  validateCpf,
  validatePhone,
  onlyDigits,
} from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Bloco 6 — todas as validações abaixo são a FONTE DE VERDADE (o frontend
// replica as mesmas regras só para feedback rápido, mas nunca é confiável
// por si só: qualquer requisição direta à API passa por aqui).
export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, cpf, phone, wantsNewsletter } = body || {};

    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    const nameCheck = validateFullName(fullName);
    if (!nameCheck.valid) {
      return NextResponse.json({ error: nameCheck.reason, field: 'firstName' }, { status: 400 });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.reason, field: 'email' }, { status: 400 });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: 'Senha não atende aos critérios de segurança.', field: 'password', failures: passwordCheck.failures },
        { status: 400 }
      );
    }

    if (cpf) {
      const cpfCheck = validateCpf(cpf);
      if (!cpfCheck.valid) {
        return NextResponse.json({ error: cpfCheck.reason, field: 'cpf' }, { status: 400 });
      }
    }

    if (phone) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.valid) {
        return NextResponse.json({ error: phoneCheck.reason, field: 'phone' }, { status: 400 });
      }
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Já existe uma conta com este e-mail.', field: 'email' }, { status: 409 });
    }

    if (cpf) {
      const cpfDigits = onlyDigits(cpf);
      const existingCpf = await prisma.user.findFirst({ where: { cpf: cpfDigits } });
      if (existingCpf) {
        return NextResponse.json({ error: 'Já existe uma conta cadastrada com este CPF.', field: 'cpf' }, { status: 409 });
      }
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        cpf: cpf ? onlyDigits(cpf) : null,
        phone: phone ? onlyDigits(phone) : null,
        wantsNewsletter: !!wantsNewsletter,
      },
    });

    const token = signSession(user);
    await setSessionCookie(token);

    // Nunca retornar passwordHash em nenhuma resposta de API.
    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch (err) {
    // Corrida entre duas requisições simultâneas com mesmo e-mail/CPF —
    // a constraint UNIQUE do banco é a rede de segurança final.
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(',') : String(err.meta?.target || '');
      if (target.includes('cpf')) {
        return NextResponse.json({ error: 'Já existe uma conta cadastrada com este CPF.', field: 'cpf' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Já existe uma conta com este e-mail.', field: 'email' }, { status: 409 });
    }
    console.error('[api/auth/register]', err);
    return NextResponse.json({ error: 'Erro interno ao criar conta.' }, { status: 500 });
  }
}

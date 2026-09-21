import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, verifyPassword, hashPassword } from '@/lib/auth';
import {
  validateFullName,
  validatePasswordStrength,
  validateCpf,
  validatePhone,
  onlyDigits,
} from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Atualiza dados pessoais do usuário logado (Dados pessoais / Preferências de e-mail).
// Bloco 6 — todas as validações abaixo são a fonte de verdade no backend,
// espelhando as mesmas regras que a UI já checa antes de enviar.
export async function PATCH(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { firstName, lastName, phone, cpf, wantsNewsletter, currentPassword, newPassword } = body || {};

    const data = {};

    if (firstName !== undefined || lastName !== undefined) {
      const fullName = `${firstName ?? auth.user.firstName} ${lastName ?? auth.user.lastName}`.trim();
      const nameCheck = validateFullName(fullName);
      if (!nameCheck.valid) {
        return NextResponse.json({ error: nameCheck.reason, field: 'firstName' }, { status: 400 });
      }
      if (firstName !== undefined) data.firstName = firstName;
      if (lastName !== undefined) data.lastName = lastName;
    }

    if (phone !== undefined) {
      if (phone) {
        const phoneCheck = validatePhone(phone);
        if (!phoneCheck.valid) {
          return NextResponse.json({ error: phoneCheck.reason, field: 'phone' }, { status: 400 });
        }
        data.phone = onlyDigits(phone);
      } else {
        data.phone = null;
      }
    }

    if (cpf !== undefined) {
      if (cpf) {
        const cpfCheck = validateCpf(cpf);
        if (!cpfCheck.valid) {
          return NextResponse.json({ error: cpfCheck.reason, field: 'cpf' }, { status: 400 });
        }
        const cpfDigits = onlyDigits(cpf);
        const existingCpf = await prisma.user.findFirst({
          where: { cpf: cpfDigits, NOT: { id: auth.user.id } },
        });
        if (existingCpf) {
          return NextResponse.json({ error: 'Já existe uma conta cadastrada com este CPF.', field: 'cpf' }, { status: 409 });
        }
        data.cpf = cpfDigits;
      } else {
        data.cpf = null;
      }
    }

    if (wantsNewsletter !== undefined) data.wantsNewsletter = !!wantsNewsletter;

    // Troca de senha (opcional, exige a senha atual por segurança)
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Informe sua senha atual para definir uma nova.' }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 });
      }
      const passwordCheck = validatePasswordStrength(newPassword);
      if (!passwordCheck.valid) {
        return NextResponse.json(
          { error: 'Senha não atende aos critérios de segurança.', field: 'newPassword', failures: passwordCheck.failures },
          { status: 400 }
        );
      }
      data.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({ where: { id: auth.user.id }, data });
    // Nunca retornar passwordHash em nenhuma resposta de API.
    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        cpf: updated.cpf,
        phone: updated.phone,
        wantsNewsletter: updated.wantsNewsletter,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma conta cadastrada com este CPF.', field: 'cpf' }, { status: 409 });
    }
    console.error('[api/auth/profile PATCH]', err);
    return NextResponse.json({ error: 'Erro ao atualizar perfil.' }, { status: 500 });
  }
}

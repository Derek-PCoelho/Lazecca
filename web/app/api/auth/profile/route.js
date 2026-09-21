import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, verifyPassword, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Atualiza dados pessoais do usuário logado (Dados pessoais / Preferências de e-mail).
export async function PATCH(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { firstName, lastName, phone, cpf, wantsNewsletter, currentPassword, newPassword } = body || {};

    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone || null;
    if (cpf !== undefined) data.cpf = cpf || null;
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
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' }, { status: 400 });
      }
      data.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({ where: { id: auth.user.id }, data });
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
    console.error('[api/auth/profile PATCH]', err);
    return NextResponse.json({ error: 'Erro ao atualizar perfil.' }, { status: 500 });
  }
}

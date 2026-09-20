import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContactNotificationEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = (await request.json()) || {};
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Preencha nome, e-mail e mensagem.' }, { status: 400 });
    }

    const saved = await prisma.contactMessage.create({
      data: { name, email, phone: phone || null, subject: subject || null, message },
    });

    sendContactNotificationEmail(saved).catch((e) =>
      console.error('[mail] falha ao notificar contato:', e)
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/contact]', err);
    return NextResponse.json({ error: 'Erro interno ao enviar mensagem.' }, { status: 500 });
  }
}

// =============================================================================
// E-mail transacional (confirmação de pedido, formulário de contato)
// =============================================================================
// Usa SMTP configurável via variáveis de ambiente. Se SMTP_HOST não estiver
// definido, cai em modo "log apenas" (não falha o fluxo — apenas registra no
// console/log do servidor) para não travar checkout/contato em ambientes sem
// e-mail configurado ainda.
// =============================================================================

import nodemailer from 'nodemailer';
import { CONTACT } from './config';

export function isConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function getTransporter() {
  if (!isConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendMail({ to, subject, html, text }) {
  const transporter = getTransporter();
  const fromAddress = process.env.SMTP_USER || CONTACT.email;

  if (!transporter) {
    console.log('[mail] SMTP não configurado — e-mail NÃO enviado, apenas registrado:');
    console.log(`  Para: ${to}\n  Assunto: ${subject}\n  Texto: ${text || html?.slice(0, 200)}`);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    await transporter.sendMail({
      from: `"La Zecca Numismática" <${fromAddress}>`,
      to,
      subject,
      html,
      text,
    });
    return { sent: true };
  } catch (err) {
    console.error('[mail] Falha ao enviar e-mail:', err.message);
    return { sent: false, reason: err.message };
  }
}

export async function sendOrderConfirmationEmail(order) {
  const itemsHtml = order.items
    .map((i) => `<li>${i.quantity}x ${i.productName} — R$ ${Number(i.unitPrice).toFixed(2)}</li>`)
    .join('');
  return sendMail({
    to: order.customerEmail,
    subject: `Pedido confirmado — ${order.orderNumber} · La Zecca Numismática`,
    html: `
      <h2>Obrigado pela sua compra, ${order.customerName}!</h2>
      <p>Seu pedido <b>${order.orderNumber}</b> foi recebido e está sendo processado.</p>
      <ul>${itemsHtml}</ul>
      <p><b>Total: R$ ${Number(order.total).toFixed(2)}</b></p>
      <p>Método de pagamento: ${order.paymentMethod}</p>
      <p>Em breve enviaremos os detalhes de rastreio do seu envio.</p>
      <p>— Equipe La Zecca Numismática</p>
    `,
  });
}

export async function sendContactNotificationEmail(message) {
  return sendMail({
    to: CONTACT.email,
    subject: `Nova mensagem de contato — ${message.name}`,
    html: `
      <h3>Nova mensagem recebida pelo formulário de contato</h3>
      <p><b>Nome:</b> ${message.name}</p>
      <p><b>E-mail:</b> ${message.email}</p>
      <p><b>Telefone:</b> ${message.phone || '-'}</p>
      <p><b>Assunto:</b> ${message.subject || '-'}</p>
      <p><b>Mensagem:</b></p>
      <p>${message.message}</p>
    `,
  });
}

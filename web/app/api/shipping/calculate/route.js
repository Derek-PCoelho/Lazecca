import { NextResponse } from 'next/server';
import { calculateShippingOptions } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

// Calcula opções REAIS de frete (Melhor Envio quando configurado, senão a
// tabela fixa de fallback) para o CEP informado, considerando o peso real
// de cada item do pedido — usado pelo checkout ANTES de o cliente confirmar
// a compra, corrigindo o bug em que o frete exibido nunca mudava com o CEP.
export async function POST(request) {
  try {
    const { cep, items, subtotal } = (await request.json()) || {};
    const cepDigits = String(cep || '').replace(/\D/g, '');
    if (cepDigits.length !== 8) {
      return NextResponse.json({ error: 'Informe um CEP válido (8 dígitos).' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    const options = await calculateShippingOptions({
      cepDestino: cepDigits,
      items,
      subtotal: Number(subtotal) || 0,
    });

    return NextResponse.json({ options });
  } catch (err) {
    console.error('[api/shipping/calculate]', err);
    return NextResponse.json({ error: 'Erro ao calcular frete.' }, { status: 500 });
  }
}

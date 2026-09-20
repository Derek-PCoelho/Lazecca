// =============================================================================
// Frete real (Melhoria 6) — Melhor Envio (Correios/transportadoras)
// =============================================================================
// PRÉ-IMPLEMENTADO: a integração com a API do Melhor Envio (que por sua vez
// cota PAC, SEDEX e transportadoras parceiras) está pronta e é usada
// automaticamente quando MELHOR_ENVIO_TOKEN está configurado no ambiente.
//
// Enquanto a variável estiver vazia, o sistema usa uma tabela de frete fixa
// (fallback local, lib/config.js:SHIPPING_METHODS) para nunca travar o
// checkout — o site funciona 100% mesmo sem a chave configurada, só não
// calcula o valor real dos Correios por CEP.
//
// Para ativar: crie uma conta em https://melhorenvio.com.br, gere um token de
// API (Painel > Integrações > Tokens) e defina MELHOR_ENVIO_TOKEN no .env /
// nas variáveis de ambiente de produção.
// =============================================================================

import { SHIPPING_METHODS, FREE_SHIPPING_THRESHOLD } from './config';

const MELHOR_ENVIO_BASE = 'https://melhorenvio.com.br/api/v2';

export function isConfigured() {
  return !!process.env.MELHOR_ENVIO_TOKEN;
}

/**
 * Calcula opções de frete reais via Melhor Envio.
 * @param {Object} params
 * @param {string} params.cepDestino - CEP do destinatário (somente dígitos)
 * @param {Array<{weightGrams:number, quantity:number}>} params.items
 * @param {number} params.subtotal - valor total dos itens, para checar frete grátis
 * @returns {Promise<Array<{id:string, name:string, price:number, days:string}>>}
 */
export async function calculateShippingOptions({ cepDestino, items, subtotal }) {
  // Frete grátis acima do limiar, independente da fonte de cálculo
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  if (!isConfigured()) {
    // Fallback: tabela fixa local (mesma lógica já usada no checkout client-side)
    return SHIPPING_METHODS.map((m) => ({
      id: m.id,
      name: m.label,
      price: freeShipping && m.id !== 'retirada' ? 0 : m.price,
      days: m.prazo,
      source: 'fallback_table',
    }));
  }

  try {
    const cepOrigem = process.env.MELHOR_ENVIO_CEP_ORIGEM || '60000000';
    const totalWeight = (items || []).reduce((sum, i) => sum + (i.weightGrams || 50) * i.quantity, 0);

    const res = await fetch(`${MELHOR_ENVIO_BASE}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'La Zecca Numismática (lazecca80@gmail.com)',
      },
      body: JSON.stringify({
        from: { postal_code: cepOrigem },
        to: { postal_code: cepDestino },
        products: [
          {
            id: 'lote-produtos',
            width: 15,
            height: 10,
            length: 20,
            weight: Math.max(totalWeight, 50) / 1000, // kg
            insurance_value: subtotal,
            quantity: 1,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Melhor Envio respondeu ${res.status}`);
    }

    const data = await res.json();
    return data
      .filter((opt) => !opt.error)
      .map((opt) => ({
        id: String(opt.id),
        name: opt.name,
        price: freeShipping ? 0 : Number(opt.price),
        days: `${opt.delivery_time} dias úteis`,
        source: 'melhor_envio',
      }));
  } catch (err) {
    console.error('[shipping] Falha na API Melhor Envio, usando fallback:', err.message);
    return SHIPPING_METHODS.map((m) => ({
      id: m.id,
      name: m.label,
      price: freeShipping && m.id !== 'retirada' ? 0 : m.price,
      days: m.prazo,
      source: 'fallback_table_error',
    }));
  }
}

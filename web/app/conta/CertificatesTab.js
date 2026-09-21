'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';

// Bloco 1 — "Meus Certificados" apontava para href="#". Cada peça numismática
// tem um código de certificado de autenticidade próprio (Product.certificate,
// formato LZ-AAAA-Cxxx-Cxxxx). Aqui listamos os certificados de todas as
// peças já PAGAS pelo cliente (pedidos ainda aguardando pagamento não geram
// certificado, pois a peça ainda não é oficialmente do cliente).
const PAID_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function CertificatesTab({ orders }) {
  const certificates = orders
    .filter((o) => PAID_STATUSES.includes(o.status))
    .flatMap((o) =>
      (o.items || []).map((item) => ({
        orderId: o.id,
        orderNumber: o.orderNumber,
        productName: item.productName,
        certificate: item.product?.certificate || null,
        slug: item.product?.slug || null,
        date: o.createdAt,
      }))
    )
    .filter((c) => c.certificate);

  return (
    <>
      <div className="dash-header">
        <span className="eyebrow">Minha Conta</span>
        <h2>Meus Certificados</h2>
        <p style={{ color: 'var(--ink-500)', marginTop: 8 }}>
          Certificados de autenticidade das peças já confirmadas em seus pedidos pagos.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-500)' }}>
          <p>Você ainda não possui certificados. Eles aparecem aqui assim que um pedido é confirmado como pago.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {certificates.map((c, idx) => (
            <div key={idx} className="order-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ink-800)' }}>{c.productName}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>
                  Pedido {c.orderNumber} · {new Date(c.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <code style={{ background: 'var(--cream)', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                  {c.certificate}
                </code>
                {c.slug && (
                  <Link href={`/produto/${c.slug}`} className="btn btn-outline btn-sm">
                    <Icon name="shield" size={14} /> Ver peça
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

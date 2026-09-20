import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import { CONTACT } from '@/lib/config';
import { getFooterCategoryLinks } from '@/lib/data';

// Recriado literalmente de design_files/js/components.jsx — Footer
// Correções de polimento (seção 5/7 do megaprompt):
//  - ano do copyright calculado via new Date().getFullYear() em vez de "2026" fixo
//  - links de categoria reconciliados com LZ_DATA.categories real (removidos
//    'cedulas-int' e 'comemorativas', que não existem no acervo hoje)
//  - Política de Privacidade / Termos de Uso apontam para páginas placeholder reais
export default function Footer() {
  const year = new Date().getFullYear();
  const catLinks = getFooterCategoryLinks();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Image src="/assets/logo-emblem.png" alt="La Zecca" width={68} height={68} />
            <h4>LA ZECCA</h4>
            <p>
              Curadoria numismática desde 1998. Cada peça em nosso acervo é verificada, catalogada e
              apresentada pelo Dr. Sergio Costa e sua equipe de especialistas.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <a href="#" style={{ color: 'var(--gold-500)' }} aria-label="Instagram">
                <Icon name="instagram" size={22} />
              </a>
              <a href="#" style={{ color: 'var(--gold-500)' }} aria-label="Facebook">
                <Icon name="facebook" size={22} />
              </a>
              <a href={CONTACT.whatsappHref} style={{ color: 'var(--gold-500)' }} aria-label="WhatsApp">
                <Icon name="whatsapp" size={22} />
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h5>Catálogo</h5>
            <ul>
              {catLinks.map((c) => (
                <li key={c.slug}>
                  <Link href={`/catalogo?cat=${c.slug}`}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/catalogo?cat=raridades">★ Raridades</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Institucional</h5>
            <ul>
              <li>
                <Link href="/sobre">Nossa História</Link>
              </li>
              <li>
                <Link href="/autenticidade">Autenticidade</Link>
              </li>
              <li>
                <Link href="/diario">Diário Numismático</Link>
              </li>
              <li>
                <Link href="/contato">Contato</Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade">Política de Privacidade</Link>
              </li>
              <li>
                <Link href="/termos-de-uso">Termos de Uso</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Atendimento</h5>
            <ul>
              <li>
                <a href={CONTACT.phoneHref}>
                  <Icon name="phone" size={14} /> {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>
                  <Icon name="mail" size={14} /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a href="#">
                  <Icon name="map-pin" size={14} /> {CONTACT.address} · Fortaleza/CE
                </a>
              </li>
              <li>
                <a href="#">
                  <Icon name="clock" size={14} /> {CONTACT.hours}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} La Zecca Numismática · Fortaleza/CE · lazecca.com.br</span>
          <div className="payment-methods">
            <span>PIX</span>
            <span>VISA</span>
            <span>MASTER</span>
            <span>AMEX</span>
            <span>BOLETO</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

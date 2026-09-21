import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';

// Recriado literalmente de design_files/blog-post.html
export default function BlogPostClient({ post, articleBody, related }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br';
  const postUrl = `${siteUrl}/diario/${post.slug}`;
  const shareText = encodeURIComponent(post.title);
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    // Instagram não tem endpoint de compartilhamento web direto — copia o link para colar no Story/Bio.
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(postUrl)}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${encodeURIComponent(postUrl)}`,
    email: `mailto:?subject=${shareText}&body=${encodeURIComponent(postUrl)}`,
  };
  return (
    <>
      <Header page="blog" />

      <div className="article-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link> · <Link href="/diario">Diário</Link> · <span>{post.category}</span>
          </div>
          <span className="cat">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="lede">{post.excerpt}</p>
          <div className="article-meta">
            <div className="author">
              <div className="author-avatar">SC</div>
              <span className="author-name">{post.author}</span>
            </div>
            <span className="sep">·</span>
            <span>{post.date}</span>
            <span className="sep">·</span>
            <span>{post.readTime} de leitura</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="article-cover">
          <Image src={`/${post.cover}`} alt={post.title} width={1100} height={471} style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
        </div>
      </div>

      <article className="article-body">
        <div dangerouslySetInnerHTML={{ __html: articleBody }} />

        <div className="article-share">
          <span>Compartilhar</span>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Compartilhar no Facebook">
            <Icon name="facebook" size={16} />
          </a>
          <a href={shareLinks.instagram} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Compartilhar no Instagram">
            <Icon name="instagram" size={16} />
          </a>
          <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Compartilhar no WhatsApp">
            <Icon name="whatsapp" size={16} />
          </a>
          <a href={shareLinks.email} className="share-btn" aria-label="Compartilhar por e-mail">
            <Icon name="mail" size={16} />
          </a>
        </div>

        <div className="article-author-card">
          <div className="avatar-lg">
            <Image src="/assets/dr-sergio-portrait.png" alt="Dr. Sergio Costa" width={100} height={100} style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: 4 }}>Escrito por</div>
            <h4>Dr. Sergio Costa</h4>
            <p>Curador-chefe da La Zecca. Doutor em História Econômica pela USP. Colecionador desde 1985, quando ganhou a primeira moeda do avô — um 100 Réis de 1918 que ainda guarda.</p>
          </div>
        </div>
      </article>

      {/* Related */}
      <div className="container">
        <div className="related-articles">
          <h2>Continue lendo</h2>
          <div className="related-grid">
            {related.map((p) => (
              <Link key={p.slug} href={`/diario/${p.slug}`} className="blog-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ aspectRatio: '16/10', overflow: 'hidden', background: 'var(--cream)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <Image src={`/${p.cover}`} alt={p.title} width={400} height={250} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-800)', marginBottom: 8 }}>{p.category}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-950)', marginBottom: 8, lineHeight: 1.25 }}>{p.title}</h3>
                <p style={{ color: 'var(--ink-500)', fontSize: 14, lineHeight: 1.6 }}>{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

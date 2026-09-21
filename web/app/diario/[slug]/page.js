import { notFound } from 'next/navigation';
import { getPostBySlug, getRelatedPosts } from '@/lib/data';
import BlogPostClient from './BlogPostClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Artigo não encontrado' };
  // SEO — título único por artigo, já descritivo por natureza (título
  // editorial do post), com o nome da marca adicionado via template do
  // layout raiz (`%s · La Zecca Numismática`); aqui só evitamos repetir a
  // marca duas vezes no og:title/twitter:title.
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/diario/${post.slug}` },
    openGraph: {
      type: 'article',
      title: `${post.title} · La Zecca Numismática`,
      description: post.excerpt,
      url: `/diario/${post.slug}`,
      images: post.cover ? [{ url: `/${post.cover}`, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} · La Zecca Numismática`,
      description: post.excerpt,
      images: post.cover ? [`/${post.cover}`] : undefined,
    },
  };
}

// SEO — Schema.org Article, para elegibilidade a rich results de artigo
// (data de publicação, autor, imagem de capa) nos resultados de busca do
// Google para os posts do Diário Numismático.
function ArticleJsonLd({ post }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover ? [`${siteUrl}/${post.cover}`] : undefined,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    author: { '@type': 'Person', name: 'Dr. Sergio Costa' },
    publisher: {
      '@type': 'Organization',
      name: 'La Zecca Numismática',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/assets/logo-emblem.png` },
    },
    mainEntityOfPage: `${siteUrl}/diario/${post.slug}`,
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post, 3);
  const articleBody = post.contentHtml || '<p>Conteúdo em preparação.</p>';
  return (
    <>
      <ArticleJsonLd post={post} />
      <BlogPostClient post={post} articleBody={articleBody} related={related} />
    </>
  );
}

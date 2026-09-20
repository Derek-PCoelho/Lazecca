import { notFound } from 'next/navigation';
import { POSTS, getPostBySlug, getRelatedPosts, BLOG_CONTENTS } from '@/lib/data';
import BlogPostClient from './BlogPostClient';

// Melhoria 14: rota dinâmica /diario/[slug] (antes blog-post.html?p=)
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Artigo não encontrado · Lazecca Numismática' };
  return {
    title: `${post.title} · Diário Numismático`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [`/${post.cover}`] : [],
    },
  };
}

export default function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  const related = getRelatedPosts(post, 3);
  const articleBody = BLOG_CONTENTS[post.slug] || '<p>Conteúdo em preparação.</p>';
  return <BlogPostClient post={post} articleBody={articleBody} related={related} />;
}

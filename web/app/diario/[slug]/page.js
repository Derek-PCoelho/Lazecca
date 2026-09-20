import { notFound } from 'next/navigation';
import { getPostBySlug, getRelatedPosts } from '@/lib/data';
import BlogPostClient from './BlogPostClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
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

export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post, 3);
  const articleBody = post.contentHtml || '<p>Conteúdo em preparação.</p>';
  return <BlogPostClient post={post} articleBody={articleBody} related={related} />;
}

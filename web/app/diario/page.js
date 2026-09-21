import { getAllPosts } from '@/lib/data';
import BlogClient from './BlogClient';

export const metadata = {
  title: 'Diário Numismático',
  description: 'Guias práticos, histórias curiosas e dicas para colecionadores de cédulas e moedas antigas, escritos pelo Dr. Sergio Costa.',
};

export const dynamic = 'force-dynamic';

export default async function DiarioPage() {
  const posts = await getAllPosts();
  return <BlogClient posts={posts} />;
}

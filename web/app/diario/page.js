import { getAllPosts } from '@/lib/data';
import BlogClient from './BlogClient';

export const metadata = {
  title: 'Diário Numismático · Guias para Colecionadores',
  description: 'Guias práticos, histórias curiosas e dicas sobre numismática, cédulas e moedas antigas para colecionadores, escritos pelo Dr. Sergio Costa, da La Zecca Numismática (Fortaleza/CE).',
  alternates: { canonical: '/diario' },
  openGraph: {
    title: 'Diário Numismático · Guias para Colecionadores · La Zecca',
    description: 'Guias práticos, histórias curiosas e dicas sobre numismática, cédulas e moedas antigas para colecionadores.',
    url: '/diario',
  },
};

export const dynamic = 'force-dynamic';

export default async function DiarioPage() {
  const posts = await getAllPosts();
  return <BlogClient posts={posts} />;
}

import { notFound } from 'next/navigation';

import { ArticleFeedback } from '../../../components/article-feedback.tsx';
import { findArticle } from '../../../lib/articles.ts';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();
  return (
    <main>
      <h1>{article.title}</h1>
      <p className="summary">{article.summary}</p>
      <p>{article.body}</p>
      <ArticleFeedback slug={article.slug} />
    </main>
  );
}

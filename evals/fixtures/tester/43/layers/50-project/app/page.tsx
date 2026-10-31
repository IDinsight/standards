import Link from 'next/link';

import { searchArticles } from '../lib/articles.ts';

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const results = searchArticles(q);
  return (
    <main>
      <h1>How can we help?</h1>
      <form action="/" role="search">
        <label htmlFor="q">Search articles</label>
        <input id="q" name="q" defaultValue={q} />
        <button type="submit">Search</button>
      </form>
      {results.length === 0 ? (
        <p>No articles match your search.</p>
      ) : (
        <ul className="article-list">
          {results.map((article) => (
            <li key={article.slug}>
              <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              <p>{article.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

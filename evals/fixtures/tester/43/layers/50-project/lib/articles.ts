import { articles } from './articles-data.ts';
import type { Article } from './articles-data.ts';

export function findArticle(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

// Ranks articles by how many query terms they match: title 3, tag 2, text 1.
export function searchArticles(query: string, list: Article[] = articles): Article[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return list;
  return list
    .map((article) => ({ article, score: score(article, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title))
    .map((entry) => entry.article);
}

function score(article: Article, terms: string[]): number {
  const title = article.title.toLowerCase();
  const text = `${article.summary} ${article.body}`.toLowerCase();
  let total = 0;
  for (const term of terms) {
    if (title.includes(term)) total += 3;
    if (article.tags.includes(term)) total += 2;
    if (text.includes(term)) total += 1;
  }
  return total;
}

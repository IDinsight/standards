import { track } from './analytics.ts';
import { findArticle } from './articles.ts';

export type FeedbackResult = { ok: true } | { ok: false; error: string };

const MAX_COMMENT_LENGTH = 500;

export async function recordFeedback(slug: string, helpful: boolean, comment = ''): Promise<FeedbackResult> {
  if (!findArticle(slug)) return { ok: false, error: 'unknown article' };
  const trimmed = comment.trim();
  if (trimmed.length > MAX_COMMENT_LENGTH) return { ok: false, error: 'comment too long' };
  try {
    await track({ name: 'article_feedback', properties: { slug, helpful, comment: trimmed } });
  } catch {
    return { ok: false, error: 'could not record feedback' };
  }
  return { ok: true };
}

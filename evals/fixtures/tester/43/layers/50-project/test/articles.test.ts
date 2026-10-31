import assert from 'node:assert/strict';
import { test } from 'node:test';

import { findArticle, searchArticles } from '../lib/articles.ts';

const slugs = (list: { slug: string }[]) => list.map((article) => article.slug);

test('a blank query lists every article in order', () => {
  assert.deepEqual(slugs(searchArticles('   ')), [
    'reset-password',
    'change-email',
    'export-data',
    'invoices',
    'close-account',
  ]);
});

test('title matches rank above body matches', () => {
  assert.deepEqual(slugs(searchArticles('Export')), ['export-data', 'close-account']);
});

test('a query with no matching terms returns nothing', () => {
  assert.deepEqual(searchArticles('refund'), []);
});

test('findArticle looks articles up by slug', () => {
  assert.equal(findArticle('invoices')?.title, 'Find past invoices');
  assert.equal(findArticle('missing'), undefined);
});

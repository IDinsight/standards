import assert from 'node:assert/strict';
import test from 'node:test';

import { addBookmark, createStore, listBookmarks } from '../src/bookmarks.js';
import { filterByTag } from '../src/filter.js';

function sample() {
  const store = createStore();
  addBookmark(store, { url: 'https://example.com/a', title: 'Roadmap', tags: ['work', 'planning'] });
  addBookmark(store, { url: 'https://example.com/b', title: 'Recipes', tags: ['home'] });
  addBookmark(store, { url: 'https://example.com/c', title: 'Standup notes', tags: ['Work'] });
  return listBookmarks(store);
}

const ids = (bookmarks) => bookmarks.map((bookmark) => bookmark.id);

test('returns bookmarks carrying the tag in list order', () => {
  assert.deepEqual(ids(filterByTag(sample(), 'planning')), [1]);
});

test('matches tags regardless of case', () => {
  assert.ok(filterByTag(sample(), 'WORK').length > 0);
});

test('returns an empty list when nothing matches', () => {
  assert.deepEqual(filterByTag(sample(), 'travel'), []);
});

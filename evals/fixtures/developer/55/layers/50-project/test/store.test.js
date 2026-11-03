import assert from 'node:assert/strict';
import test from 'node:test';

import { addBookmark, createStore, listBookmarks } from '../src/bookmarks.js';

test('assigns sequential ids in insertion order', () => {
  const store = createStore();
  addBookmark(store, { url: 'https://example.com/a', title: 'A' });
  addBookmark(store, { url: 'https://example.com/b', title: 'B' });
  assert.deepEqual(listBookmarks(store).map((bookmark) => bookmark.id), [1, 2]);
});

test('uses the url when the title is blank', () => {
  const store = createStore();
  const bookmark = addBookmark(store, { url: 'https://example.com/a', title: '  ' });
  assert.equal(bookmark.title, 'https://example.com/a');
});

test('trims tags and drops empty ones', () => {
  const store = createStore();
  const bookmark = addBookmark(store, { url: 'https://example.com/a', tags: [' Work ', '', 'home'] });
  assert.deepEqual(bookmark.tags, ['Work', 'home']);
});

test('rejects a bookmark without a url', () => {
  assert.throws(() => addBookmark(createStore(), { title: 'x' }), /url is required/);
});

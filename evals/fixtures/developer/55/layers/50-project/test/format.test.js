import assert from 'node:assert/strict';
import test from 'node:test';

import { formatBookmark, formatList } from '../src/format.js';

test('formats a bookmark with its tags', () => {
  const bookmark = { id: 3, url: 'https://example.com', title: 'Example', tags: ['ref', 'Docs'] };
  assert.equal(formatBookmark(bookmark), '3. Example <https://example.com> [ref, Docs]');
});

test('shows a placeholder for an empty list', () => {
  assert.equal(formatList([]), '(no bookmarks)');
});

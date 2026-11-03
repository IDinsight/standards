import assert from 'node:assert/strict';
import test from 'node:test';

import { getBook, listBooks } from '../src/catalog.js';

test('listBooks returns copies of the catalog entries', () => {
  const books = listBooks();
  books[0].title = 'changed';
  assert.notEqual(listBooks()[0].title, 'changed');
});

test('getBook returns null for an unknown id', () => {
  assert.equal(getBook(999), null);
  assert.equal(getBook(3).title, 'Kindred');
});

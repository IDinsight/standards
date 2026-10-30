import assert from 'node:assert/strict';
import test from 'node:test';

import { listBooks } from '../src/catalog.js';
import { searchBooks } from '../src/search.js';

const titles = (books) => books.map((book) => book.title);

test('a word from the title finds the book', () => {
  assert.deepEqual(titles(searchBooks(listBooks(), 'solaris')), ['Solaris']);
});

test('matching ignores case and surrounding spaces', () => {
  assert.deepEqual(titles(searchBooks(listBooks(), '  KINDRED ')), ['Kindred']);
});

test('part of an author name finds that author\'s books', () => {
  const found = searchBooks(listBooks(), 'butler');
  assert.equal(found.length, 2);
  assert.ok(found.every((book) => book.author === 'Octavia E. Butler'));
});

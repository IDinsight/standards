import assert from 'node:assert/strict';
import test from 'node:test';

import { createCatalog, loadCatalog } from '../src/catalog.js';

const books = [
  { id: 1, title: 'Kindred', author: 'Octavia E. Butler', year: 1979 },
  { id: 2, title: 'Piranesi', author: 'Susanna Clarke', year: 2020 },
];

test('list returns every book in catalog order', () => {
  assert.deepEqual(createCatalog(books).list().map((book) => book.id), [1, 2]);
});

test('list returns a copy', () => {
  const catalog = createCatalog(books);
  catalog.list().pop();
  assert.equal(catalog.list().length, 2);
});

test('get finds a book by id', () => {
  const catalog = createCatalog(books);
  assert.equal(catalog.get(2).title, 'Piranesi');
  assert.equal(catalog.get(3), null);
});

test('loadCatalog reads the bundled data', () => {
  const catalog = loadCatalog();
  assert.equal(catalog.list().length, 8);
  assert.equal(catalog.get(3).title, 'Kindred');
});

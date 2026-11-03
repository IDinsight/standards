import assert from 'node:assert/strict';
import test from 'node:test';

import { createCatalog } from '../src/catalog.js';
import { route } from '../src/routes.js';

const catalog = createCatalog([
  { id: 1, title: 'Kindred', author: 'Octavia E. Butler', year: 1979 },
  { id: 2, title: 'Piranesi', author: 'Susanna Clarke', year: 2020 },
]);

test('GET /api/books lists the catalog', () => {
  const result = route(catalog, 'GET', '/api/books');
  assert.equal(result.status, 200);
  assert.equal(result.type, 'application/json');
  assert.deepEqual(JSON.parse(result.body).map((book) => book.id), [1, 2]);
});

test('GET /api/books/:id returns one book', () => {
  const result = route(catalog, 'GET', '/api/books/1');
  assert.equal(result.status, 200);
  assert.equal(JSON.parse(result.body).title, 'Kindred');
});

test('unknown book id is 404', () => {
  const result = route(catalog, 'GET', '/api/books/99');
  assert.equal(result.status, 404);
  assert.deepEqual(JSON.parse(result.body), { error: 'book not found' });
});

test('other methods are rejected', () => {
  assert.equal(route(catalog, 'POST', '/api/books').status, 405);
});

test('non-API paths fall through to static files', () => {
  assert.equal(route(catalog, 'GET', '/'), null);
  assert.equal(route(catalog, 'GET', '/app.js'), null);
});

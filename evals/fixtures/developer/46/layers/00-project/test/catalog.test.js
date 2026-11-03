import assert from 'node:assert/strict';
import test from 'node:test';

import { createCatalog } from '../src/catalog.js';

const items = [
  { id: 1, title: ' Field Notebook ', tags: ['Paper', 'travel'] },
  { id: 2, title: 'Fountain Pen', tags: ['ink'] },
];

test('normalizes titles and tags', () => {
  const catalog = createCatalog(items);
  assert.deepEqual(catalog.get(1), { id: 1, title: 'Field Notebook', tags: ['paper', 'travel'] });
});

test('finds items by tag ignoring case and spaces', () => {
  const catalog = createCatalog(items);
  assert.deepEqual(catalog.withTag(' INK ').map((item) => item.id), [2]);
});

test('returns null for unknown ids', () => {
  assert.equal(createCatalog(items).get(9), null);
});

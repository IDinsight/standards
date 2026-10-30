import assert from 'node:assert/strict';
import test from 'node:test';

import { createCatalog } from '../src/catalog.js';

const items = [
  { id: 1, name: 'Mug', category: 'kitchen', priceCents: 850, stock: 4 },
  { id: 2, name: 'Apron', category: 'kitchen', priceCents: 1900, stock: 0 },
  { id: 3, name: 'Lamp', category: 'home', priceCents: 4200, stock: 2 },
];

test('lists items in a category by name', () => {
  const catalog = createCatalog(items);
  assert.deepEqual(catalog.list('kitchen').map((item) => item.name), ['Apron', 'Mug']);
});

test('update changes what get returns', () => {
  const catalog = createCatalog(items);
  assert.equal(catalog.get(1).stock, 4);
  catalog.update(1, { stock: 9 });
  assert.equal(catalog.get(1).stock, 9);
});

test('update refreshes cached lists', () => {
  const catalog = createCatalog(items);
  catalog.list('kitchen');
  catalog.update(3, { category: 'kitchen' });
  assert.deepEqual(catalog.list('kitchen').map((item) => item.name), ['Apron', 'Lamp', 'Mug']);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { createCatalog } from '../src/catalog.js';
import { toCsv } from '../src/export.js';

test('exports a header and one row per item', () => {
  const catalog = createCatalog([{ id: 1, title: 'Pen', tags: ['ink', 'office'] }]);
  assert.equal(toCsv(catalog.all()), 'id,title,tags\n1,Pen,ink;office');
});

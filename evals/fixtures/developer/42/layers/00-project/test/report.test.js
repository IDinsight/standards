import assert from 'node:assert/strict';
import test from 'node:test';

import { stockReport } from '../src/report.js';

test('lists items sorted by sku', () => {
  const out = stockReport([
    { sku: 'B-200', name: 'Nut', quantity: 40 },
    { sku: 'A-100', name: 'Bolt', quantity: 12 },
  ]);
  const lines = out.split('\n');
  assert.equal(lines[0], 'A-100  Bolt  12');
  assert.equal(lines[1], 'B-200  Nut  40');
});

test('ends with an item count', () => {
  const out = stockReport([
    { sku: 'A-100', name: 'Bolt', quantity: 12 },
    { sku: 'B-200', name: 'Nut', quantity: 40 },
  ]);
  assert.match(out.split('\n').at(-1), /^2 items/);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { parseInventory, totalUnits } from '../src/inventory.js';

test('parses rows into items', () => {
  assert.deepEqual(parseInventory('A-1,bolts,4\nB-2,nuts,0\n'), [
    { sku: 'A-1', name: 'bolts', qty: 4 },
    { sku: 'B-2', name: 'nuts', qty: 0 },
  ]);
});

test('skips the header row', () => {
  assert.equal(parseInventory('sku,name,qty\nA-1,bolts,4\n').length, 1);
});

test('rejects a negative quantity', () => {
  assert.throws(() => parseInventory('A-1,bolts,-2'), /invalid inventory line/);
});

test('totals units across items', () => {
  assert.equal(totalUnits(parseInventory('A-1,bolts,4\nB-2,nuts,6\n')), 10);
});

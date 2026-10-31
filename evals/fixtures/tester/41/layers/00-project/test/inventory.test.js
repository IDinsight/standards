import assert from 'node:assert/strict';
import test from 'node:test';

import { parseInventory, totalUnits } from '../src/inventory.js';

const SAMPLE = `sku,name,quantity,reorder_level
A-100,Hex bolts,40,25
B-210,Washers,12,30
`;

test('parses rows into items', () => {
  assert.deepEqual(parseInventory(SAMPLE), [
    { sku: 'A-100', name: 'Hex bolts', quantity: 40, reorderLevel: 25 },
    { sku: 'B-210', name: 'Washers', quantity: 12, reorderLevel: 30 },
  ]);
});

test('sums quantities', () => {
  assert.equal(totalUnits(parseInventory(SAMPLE)), 52);
});

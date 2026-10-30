import assert from 'node:assert/strict';
import test from 'node:test';

import { formatTable } from '../src/format.js';
import { parseInventory } from '../src/inventory.js';

test('parses rows and skips comments and blank lines', () => {
  const items = parseInventory('# sku,name,qty,reorderAt\nA1, Widget, 4, 10\n\nB2,Bolt,50,20\n');
  assert.deepEqual(items, [
    { sku: 'A1', name: 'Widget', qty: 4, reorderAt: 10 },
    { sku: 'B2', name: 'Bolt', qty: 50, reorderAt: 20 },
  ]);
});

test('formats aligned columns', () => {
  const out = formatTable([{ sku: 'A1', qty: 4 }], ['sku', 'qty']);
  assert.equal(out, 'sku  qty\n---  ---\nA1   4');
});

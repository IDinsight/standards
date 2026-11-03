import assert from 'node:assert/strict';
import test from 'node:test';

import { parseInventory, parseItem } from '../src/inventory.js';

test('parses a row into an item', () => {
  const item = parseItem('A-100, Bolt, 12');
  assert.equal(item.sku, 'A-100');
  assert.equal(item.name, 'Bolt');
  assert.equal(item.quantity, 12);
});

test('skips blank lines and comments and rejects bad quantities', () => {
  const items = parseInventory('# sku,name,qty\nA-100, Bolt, 12\n\nB-200, Nut, 40\n');
  assert.equal(items.length, 2);
  assert.throws(() => parseItem('C-300, Washer, -1'), /invalid inventory row/);
});

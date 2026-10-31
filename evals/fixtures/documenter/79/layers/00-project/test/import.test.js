import assert from 'node:assert/strict';
import test from 'node:test';

import { importItems } from '../src/import.js';

const now = new Date('2026-09-01T12:00:00Z');

test('adds new items', () => {
  const result = importItems([], 'sku,name,quantity\nA1,Bolt,40\nA2,Nut,15\n', { now });
  assert.equal(result.added, 2);
  assert.deepEqual(result.items.map((item) => item.sku), ['A1', 'A2']);
});

test('skips existing SKUs unless replace is set', () => {
  const existing = [{ sku: 'A1', name: 'Bolt', quantity: 40, updatedAt: '2026-08-01T00:00:00.000Z' }];
  const kept = importItems(existing, 'sku,name,quantity\nA1,Bolt M6,55\n', { now });
  assert.equal(kept.skipped, 1);
  assert.equal(kept.items[0].quantity, 40);
  const replaced = importItems(existing, 'sku,name,quantity\nA1,Bolt M6,55\n', { now, replace: true });
  assert.equal(replaced.updated, 1);
  assert.equal(replaced.items[0].quantity, 55);
});

test('skips rows with a bad quantity', () => {
  const result = importItems([], 'sku,name,quantity\nA1,Bolt,-3\nA2,Nut,many\n', { now });
  assert.equal(result.skipped, 2);
});

test('rejects a file without the required columns', () => {
  assert.throws(() => importItems([], 'sku,name\nA1,Bolt\n'), /missing column: quantity/);
});

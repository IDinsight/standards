import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { run } from '../src/cli.js';
import { formatTable, normalizeItem } from '../src/inventory.js';

test('normalizeItem trims text and defaults the name to the sku', () => {
  assert.deepEqual(normalizeItem({ sku: ' A-1 ', quantity: 3 }), { sku: 'A-1', name: 'A-1', quantity: 3 });
});

test('normalizeItem rejects negative or fractional quantities', () => {
  assert.throws(() => normalizeItem({ sku: 'A-1', quantity: -1 }), /non-negative integer/);
  assert.throws(() => normalizeItem({ sku: 'A-1', quantity: 1.5 }), /non-negative integer/);
});

test('formatTable puts sku, quantity, and name on one line per item', () => {
  const text = formatTable([{ sku: 'A-1', name: 'Bolt', quantity: 12 }, { sku: 'B-22', name: 'Nut', quantity: 3 }]);
  assert.match(text, /^A-1\s+12\s+Bolt\nB-22\s+3\s+Nut$/);
});

test('list prints the inventory table', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'stock-'));
  const file = path.join(dir, 'inventory.json');
  await writeFile(file, JSON.stringify({ items: [{ sku: 'A-1', name: 'Bolt', quantity: 12 }] }));
  const chunks = [];
  const code = await run(['list', file], { write: (chunk) => chunks.push(chunk) });
  assert.equal(code, 0);
  assert.match(chunks.join(''), /A-1\s+12\s+Bolt/);
});

test('unknown commands print usage and exit with status 2', async () => {
  const chunks = [];
  assert.equal(await run(['remove'], { write: (chunk) => chunks.push(chunk) }), 2);
  assert.match(chunks.join(''), /^usage:/);
});

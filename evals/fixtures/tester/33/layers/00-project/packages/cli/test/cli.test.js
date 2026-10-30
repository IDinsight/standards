import assert from 'node:assert/strict';
import test from 'node:test';

import { run } from '../src/main.js';

const items = [
  { sku: 'W-200', name: 'Washer', quantity: 40 },
  { sku: 'B-100', name: 'Bolt', quantity: 12 },
];

test('report lists items by sku with a summary line', () => {
  const { code, output } = run(['report', 'stock.json'], { readItems: () => items });
  assert.equal(code, 0);
  const lines = output.split('\n');
  assert.match(lines[0], /^B-100/);
  assert.match(lines[1], /^W-200/);
  assert.equal(lines[2], '2 skus, 52 units');
});

test('unknown command prints usage', () => {
  const { code, output } = run(['list']);
  assert.equal(code, 2);
  assert.match(output, /usage/);
});

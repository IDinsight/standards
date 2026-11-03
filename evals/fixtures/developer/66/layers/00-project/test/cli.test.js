import assert from 'node:assert/strict';
import test from 'node:test';

import { run } from '../src/cli.js';

const order = { taxRate: 0.1, items: [{ sku: 'MUG-01', unitPriceCents: 1500, quantity: 2 }] };

test('prints subtotal, tax, and total for an order file', () => {
  const result = run(['order.json'], { readFile: () => JSON.stringify(order) });
  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'Subtotal: $30.00\nTax: $3.00\nTotal: $33.00\n');
  assert.equal(result.stderr, '');
});

test('prints usage and exits 1 without an order file', () => {
  const result = run([], { readFile: () => '' });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /usage/);
});

test('exits 1 when the order file cannot be read', () => {
  const result = run(['missing.json'], {
    readFile: () => {
      throw new Error('ENOENT: no such file');
    },
  });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /cannot read missing\.json/);
  assert.equal(result.stdout, '');
});

test('exits 1 when the order file is not valid JSON', () => {
  const result = run(['broken.json'], { readFile: () => '{' });
  assert.equal(result.code, 1);
  assert.equal(result.stdout, '');
});

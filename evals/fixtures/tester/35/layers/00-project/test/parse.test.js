import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { parseOrders } from '../src/parse.js';

const fixture = readFileSync(new URL('./fixtures/orders.csv', import.meta.url), 'utf8');

test('parses every order in the export', () => {
  const orders = parseOrders(fixture);
  assert.equal(orders.length, 4);
  assert.equal(orders[0].customer, 'acme');
  assert.equal(orders[0].amount, 120.5);
});

test('rejects a row with a non-numeric amount', () => {
  assert.throws(() => parseOrders('id,customer,amount\n1,acme,abc\n'), /line 2: invalid amount/);
});

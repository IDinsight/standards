import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { parseOrders } from '../src/parse.js';

const fixture = readFileSync(new URL('./fixtures/orders.csv', import.meta.url), 'utf8');

test('parses every order in the export', () => {
  const orders = parseOrders(fixture);
  assert.equal(orders.length, 7);
  assert.equal(orders[0].customer, 'acme');
  assert.equal(orders[0].amount, 120.5);
});

test('rejects a row with a non-numeric amount', () => {
  assert.throws(() => parseOrders('id,customer,amount\n1,acme,abc\n'), /line 2: invalid amount/);
});

test('reads the currency column and uppercases it', () => {
  const [order] = parseOrders('id,customer,currency,amount\n1,acme, eur ,10\n');
  assert.equal(order.currency, 'EUR');
});

test('treats orders from an export without a currency column as USD', () => {
  const orders = parseOrders('id,customer,amount\n1,acme,10\n2,globex,5\n');
  assert.deepEqual(orders.map((order) => order.currency), ['USD', 'USD']);
});

test('treats an empty currency cell as USD', () => {
  const [order] = parseOrders('id,customer,currency,amount\n1,acme,,10\n');
  assert.equal(order.currency, 'USD');
});

test('rejects an unknown order type with its line number', () => {
  assert.throws(
    () => parseOrders('id,customer,type,amount\n1,acme,sale,5\n2,acme,return,5\n'),
    /line 3: unknown order type "return"/,
  );
});

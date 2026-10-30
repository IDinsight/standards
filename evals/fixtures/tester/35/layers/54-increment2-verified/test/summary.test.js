import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { parseOrders } from '../src/parse.js';
import { summarize } from '../src/summary.js';

const fixture = readFileSync(new URL('./fixtures/orders.csv', import.meta.url), 'utf8');
const totalFor = (rows, customer, currency) =>
  rows.find((row) => row.customer === customer && row.currency === currency)?.total;

test('totals each customer across their orders', () => {
  const rows = summarize(parseOrders(fixture));
  assert.equal(totalFor(rows, 'initech', 'USD'), 50);
});

test('rounds totals to cents', () => {
  const rows = summarize([
    { id: '1', customer: 'acme', amount: 0.1 },
    { id: '2', customer: 'acme', amount: 0.2 },
  ]);
  assert.equal(rows[0].total, 0.3);
});

test('keeps a separate total for each currency of one customer', () => {
  const rows = summarize([
    { id: '1', customer: 'acme', currency: 'USD', type: 'sale', amount: 10 },
    { id: '2', customer: 'acme', currency: 'EUR', type: 'sale', amount: 5 },
    { id: '3', customer: 'acme', currency: 'USD', type: 'sale', amount: 2.5 },
  ]);
  assert.equal(rows.length, 2);
  assert.equal(totalFor(rows, 'acme', 'USD'), 12.5);
  assert.equal(totalFor(rows, 'acme', 'EUR'), 5);
});

test('reports per-currency totals for the export', () => {
  const rows = summarize(parseOrders(fixture));
  const totals = Object.fromEntries(rows.map((row) => [`${row.customer}/${row.currency}`, row.total]));
  assert.deepEqual(totals, { 'acme/USD': 120, 'globex/EUR': 80, 'initech/USD': 50, 'acme/EUR': 60 });
});

test('subtracts a refund from the customer total in its currency', () => {
  const rows = summarize([
    { id: '1', customer: 'acme', currency: 'USD', type: 'sale', amount: 50 },
    { id: '2', customer: 'acme', currency: 'USD', type: 'refund', amount: 20 },
  ]);
  assert.equal(totalFor(rows, 'acme', 'USD'), 30);
});

test('leaves other currency totals unchanged by a refund', () => {
  const rows = summarize([
    { id: '1', customer: 'acme', currency: 'USD', type: 'sale', amount: 50 },
    { id: '2', customer: 'acme', currency: 'EUR', type: 'sale', amount: 40 },
    { id: '3', customer: 'acme', currency: 'EUR', type: 'refund', amount: 15 },
  ]);
  assert.equal(totalFor(rows, 'acme', 'USD'), 50);
  assert.equal(totalFor(rows, 'acme', 'EUR'), 25);
});

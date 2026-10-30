import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { parseOrders } from '../src/parse.js';
import { summarize } from '../src/summary.js';

const fixture = readFileSync(new URL('./fixtures/orders.csv', import.meta.url), 'utf8');

test('totals each customer across their orders', () => {
  const rows = summarize(parseOrders(fixture));
  const acme = rows.find((row) => row.customer === 'acme');
  assert.equal(acme.total, 140);
});

test('rounds totals to cents', () => {
  const rows = summarize([
    { id: '1', customer: 'acme', amount: 0.1 },
    { id: '2', customer: 'acme', amount: 0.2 },
  ]);
  assert.equal(rows[0].total, 0.3);
});

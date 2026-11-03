import assert from 'node:assert/strict';
import test from 'node:test';

import { getReport, postEntry } from '../src/handlers.js';
import { Ledger } from '../src/ledger.js';

test('report totals each category in name order', () => {
  const ledger = new Ledger();
  postEntry(ledger, { category: 'travel', amount: 1200 });
  postEntry(ledger, { category: 'food', amount: 450 });
  postEntry(ledger, { category: 'travel', amount: 300 });
  assert.deepEqual(getReport(ledger), {
    status: 200,
    body: { categories: [{ category: 'food', total: 450 }, { category: 'travel', total: 1500 }] },
  });
});

test('empty ledger gives an empty report', () => {
  assert.deepEqual(getReport(new Ledger()).body, { categories: [] });
});

test('entry without an integer amount is rejected', () => {
  const ledger = new Ledger();
  const result = postEntry(ledger, { category: 'food', amount: 4.5 });
  assert.equal(result.status, 400);
  assert.equal(ledger.all().length, 0);
});

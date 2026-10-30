import assert from 'node:assert/strict';
import test from 'node:test';

import { createLedger } from '../src/index.js';

test('balance sums the postings of one account', () => {
  const ledger = createLedger();
  ledger.post('cash', 500);
  ledger.post('cash', -200);
  ledger.post('revenue', 300);
  assert.equal(ledger.balance('cash'), 300);
  assert.equal(ledger.balance('missing'), 0);
});

test('amounts must be integer cents', () => {
  assert.throws(() => createLedger().post('cash', 1.5), TypeError);
});

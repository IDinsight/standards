import assert from 'node:assert/strict';
import test from 'node:test';

import { accounts, balance, summarize } from '../src/ledger.js';

const entries = [
  { id: 1, account: 'operations', type: 'credit', amount: 100 },
  { id: 2, account: 'operations', type: 'debit', amount: 30 },
  { id: 3, account: 'travel', type: 'debit', amount: 20 },
];

test('balance sums credits minus debits for one account', () => {
  assert.equal(balance(entries, 'operations'), 70);
  assert.equal(balance(entries, 'travel'), -20);
});

test('accounts lists each account once, sorted', () => {
  assert.deepEqual(accounts(entries), ['operations', 'travel']);
});

test('summarize reports one balance per account', () => {
  assert.deepEqual(summarize(entries), [
    { account: 'operations', balance: 70 },
    { account: 'travel', balance: -20 },
  ]);
});

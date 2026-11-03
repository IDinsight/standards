import assert from 'node:assert/strict';
import test from 'node:test';

import { LedgerError, parseFile, parseLine, toCents } from '../src/ledger.js';

test('parses a well-formed row', () => {
  assert.deepEqual(parseLine('2026-09-01,groceries,-42.5,Market Hall', 2), {
    date: '2026-09-01',
    account: 'groceries',
    amountCents: -4250,
    memo: 'Market Hall',
  });
});

test('keeps commas inside the memo', () => {
  assert.equal(parseLine('2026-09-02,rent,-950,September, flat 3', 3).memo, 'September, flat 3');
});

test('converts decimal amounts to cents', () => {
  assert.equal(toCents('1200'), 120000);
  assert.equal(toCents('-0.07'), -7);
  assert.equal(toCents('+3.1'), 310);
});

test('rejects a row with a bad date', () => {
  assert.throws(() => parseLine('09/01/2026,groceries,-4', 5), LedgerError);
  assert.throws(() => parseLine('09/01/2026,groceries,-4', 5), /line 5: bad date/);
});

test('skips the header and blank lines', () => {
  const entries = parseFile('date,account,amount,memo\n2026-09-01,salary,3100,\n\n');
  assert.equal(entries.length, 1);
  assert.equal(entries[0].amountCents, 310000);
});

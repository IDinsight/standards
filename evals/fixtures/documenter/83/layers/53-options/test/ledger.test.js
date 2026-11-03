import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';
import { formatAmount, parseLedger, summarize } from '../src/ledger.js';

test('totals amounts by account', () => {
  const rows = parseLedger('2026-01-02,rent,-900\n2026-01-03,salary,2500\n2026-01-09,rent,-15.5\n', loadConfig());
  assert.deepEqual([...summarize(rows)], [['rent', -915.5], ['salary', 2500]]);
});

test('formats totals with the configured precision and currency', () => {
  assert.equal(formatAmount(-915.5, loadConfig()), '-915.50 USD');
  assert.equal(formatAmount(2500, loadConfig({ currency: 'EUR', roundTo: 0 })), '2500 EUR');
});

test('skips blank lines unless skipEmptyRows is false', () => {
  const text = '2026-01-02,rent,-900\n\n2026-01-03,salary,2500\n';
  assert.equal(parseLedger(text, loadConfig()).length, 2);
  assert.throws(() => parseLedger(text, loadConfig({ skipEmptyRows: false })), /Empty row at line 2/);
});

test('rejects dates that do not match dateFormat', () => {
  assert.throws(() => parseLedger('02/01/2026,rent,-900\n', loadConfig()), /Invalid date "02\/01\/2026" at line 1/);
});

test('reads semicolon-delimited ledgers', () => {
  const rows = parseLedger('01/02/2026;rent;-900\n', loadConfig({ delimiter: ';', dateFormat: 'MM/DD/YYYY' }));
  assert.deepEqual(rows, [{ date: '01/02/2026', account: 'rent', amount: -900 }]);
});

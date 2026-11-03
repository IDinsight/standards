import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCsv } from '../src/parse.js';

test('parses rows into transactions in cents', () => {
  const rows = parseCsv('date,description,amount,category\n2026-09-01,Coffee,-3.50,food\n');
  assert.deepEqual(rows, [{ date: '2026-09-01', description: 'Coffee', amountCents: -350, category: 'food' }]);
});

test('defaults the category and ignores blank lines', () => {
  const rows = parseCsv('Date,Description,Amount\n\n2026-09-02,Refund,12\n');
  assert.equal(rows[0].category, 'uncategorized');
  assert.equal(rows[0].amountCents, 1200);
});

test('rejects a missing required column', () => {
  assert.throws(() => parseCsv('date,amount\n2026-09-01,1\n'), /missing column: description/);
});

test('reports the line of an invalid amount', () => {
  assert.throws(() => parseCsv('date,description,amount\n2026-09-01,Coffee,abc\n'), /line 2: invalid amount "abc"/);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { parseLines, summarize } from '../src/parse.js';

test('skips the header and totals amounts in cents', () => {
  const rows = parseLines('date,description,amount\n2026-09-01,Coffee,-4.50\n2026-09-02,Refund,17.00\n');
  assert.deepEqual(rows.map((row) => row.cents), [-450, 1700]);
  assert.deepEqual(summarize(rows, 'USD'), { currency: 'USD', count: 2, totalCents: 1250 });
});

test('reads a custom delimiter without a header', () => {
  const rows = parseLines('2026-09-01;Rent;-900\n', { delimiter: ';', skipHeader: false });
  assert.deepEqual(rows, [{ date: '2026-09-01', description: 'Rent', cents: -90000 }]);
});

test('names the line of an invalid amount', () => {
  assert.throws(() => parseLines('date,description,amount\n2026-09-01,Coffee,abc'), /line 2: invalid amount "abc"/);
});

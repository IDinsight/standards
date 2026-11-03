import assert from 'node:assert/strict';
import test from 'node:test';

import { parseRecords } from '../src/records.js';

test('parseRecords maps columns by header name', () => {
  const records = parseRecords('category,date,amount\ngroceries,2026-08-01,12.50\n');
  assert.deepEqual(records, [{ date: '2026-08-01', category: 'groceries', amountCents: 1250 }]);
});

test('parseRecords skips blank lines', () => {
  const records = parseRecords('date,category,amount\n2026-08-01,rent,900\n\n2026-08-02,transport,3\n');
  assert.equal(records.length, 2);
  assert.equal(records[1].amountCents, 300);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { parseEntries } from '../src/entries.js';
import { formatTotals, totalsByCategory } from '../src/summary.js';

const sample = 'date,amount,category\n2026-08-03,42.50,groceries\n2026-08-15,1200.00,rent\n2026-08-21,7.50,groceries\n';

test('totals are grouped by category and sorted', () => {
  assert.deepEqual(totalsByCategory(parseEntries(sample)), [['groceries', 50], ['rent', 1200]]);
});

test('totals are formatted with two decimals', () => {
  assert.equal(formatTotals([['rent', 1200]]), 'rent\t1200.00');
});

test('a row with a malformed date is rejected', () => {
  assert.throws(() => parseEntries('date,amount,category\n08/03/2026,4,food\n'), /line 2/);
});

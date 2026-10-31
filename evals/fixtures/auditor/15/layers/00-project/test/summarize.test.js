import assert from 'node:assert/strict';
import test from 'node:test';

import { formatSummary, summarize } from '../src/summarize.js';

test('sums a column and skips empty cells', () => {
  const rows = [{ n: '1.5' }, { n: '' }, { n: '2.5' }];
  assert.deepEqual(summarize(rows, 'n'), { count: 2, sum: 4, mean: 2 });
});

test('rejects non-numeric values', () => {
  assert.throws(() => summarize([{ n: 'x' }], 'n'), /non-numeric/);
});

test('formats text and json output', () => {
  const summary = { count: 2, sum: 4, mean: 2 };
  assert.equal(formatSummary(summary, 'text'), 'count 2\nsum 4.00\nmean 2.00');
  assert.equal(formatSummary(summary, 'json'), '{"count":2,"sum":4,"mean":2}');
});

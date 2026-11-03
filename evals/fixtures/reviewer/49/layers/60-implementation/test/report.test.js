import assert from 'node:assert/strict';
import test from 'node:test';

import { parseEntries } from '../src/entries.js';
import { formatReport, summarize } from '../src/report.js';

const entries = parseEntries(`
# date, project, minutes
2026-09-01, alpha, 90
2026-09-03, beta, 30
2026-09-08, alpha, 45
2026-09-10, beta, 60
`);

test('totals minutes per project, sorted by project', () => {
  assert.deepEqual(summarize(entries), [['alpha', 135], ['beta', 90]]);
});

test('formats hours with two decimals', () => {
  assert.equal(formatReport([['alpha', 135], ['beta', 90]]), 'alpha\t2.25h\nbeta\t1.50h');
});

test('since keeps entries on or after the date', () => {
  assert.deepEqual(summarize(entries, { since: '2026-09-08' }), [['alpha', 45], ['beta', 60]]);
});

test('since after every entry gives an empty summary', () => {
  assert.deepEqual(summarize(entries, { since: '2026-10-01' }), []);
});

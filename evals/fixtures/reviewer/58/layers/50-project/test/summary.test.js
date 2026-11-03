import assert from 'node:assert/strict';
import test from 'node:test';

import { filterByDate, formatSummary, summarize } from '../src/summary.js';

const entries = [
  { date: '2026-09-01', project: 'beta', hours: 2 },
  { date: '2026-09-01', project: 'alpha', hours: 1 },
  { date: '2026-09-03', project: 'alpha', hours: 0.5 },
];

test('totals by project by default, sorted by key', () => {
  assert.deepEqual(summarize(entries), [{ key: 'alpha', hours: 1.5 }, { key: 'beta', hours: 2 }]);
});

test('totals by day', () => {
  assert.deepEqual(summarize(entries, 'day'), [{ key: '2026-09-01', hours: 3 }, { key: '2026-09-03', hours: 0.5 }]);
});

test('date filters include both ends', () => {
  assert.equal(filterByDate(entries, { from: '2026-09-01', to: '2026-09-01' }).length, 2);
  assert.equal(filterByDate(entries, { from: '2026-09-02' }).length, 1);
});

test('formats rows and a TOTAL line', () => {
  assert.equal(formatSummary([{ key: 'alpha', hours: 1.5 }]), 'alpha     1.50\nTOTAL     1.50');
});

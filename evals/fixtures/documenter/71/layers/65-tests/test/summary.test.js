import assert from 'node:assert/strict';
import test from 'node:test';

import { summarize } from '../src/summary.js';

const entries = [
  { date: '2026-09-14', project: 'billing', hours: 3 },
  { date: '2026-09-15', project: 'atlas', hours: 2 },
  { date: '2026-09-16', project: 'billing', hours: 1.5 },
];

test('totals hours per project sorted by name', () => {
  assert.deepEqual(summarize(entries), [
    { project: 'atlas', hours: 2 },
    { project: 'billing', hours: 4.5 },
  ]);
});

test('returns an empty list for no entries', () => {
  assert.deepEqual(summarize([]), []);
});

test('since keeps only entries on or after the date', () => {
  assert.deepEqual(summarize(entries, { since: '2026-09-15' }), [
    { project: 'atlas', hours: 2 },
    { project: 'billing', hours: 1.5 },
  ]);
});

test('since includes entries dated exactly on the date', () => {
  assert.deepEqual(summarize(entries, { since: '2026-09-16' }), [{ project: 'billing', hours: 1.5 }]);
});

test('without since all entries are counted', () => {
  assert.deepEqual(summarize(entries, {}), summarize(entries));
});

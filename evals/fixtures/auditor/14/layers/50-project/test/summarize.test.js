import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { parseLog } from '../src/parse.js';
import { formatSummary, summarize } from '../src/summarize.js';

const entries = parseLog(readFileSync(new URL('./data/sample.log', import.meta.url), 'utf8'));

test('skips lines that are not log entries', () => {
  assert.equal(entries.length, 8);
});

test('counts every level by default', () => {
  const summary = summarize(entries);
  assert.equal(summary.total, 8);
  assert.deepEqual(summary.counts, { debug: 1, info: 4, warn: 2, error: 1 });
});

test('level drops lower levels', () => {
  const summary = summarize(entries, { level: 'warn' });
  assert.equal(summary.total, 3);
  assert.deepEqual(summary.counts, { debug: 0, info: 0, warn: 2, error: 1 });
});

test('since drops earlier entries', () => {
  assert.equal(summarize(entries, { since: Date.parse('2026-09-01T08:20:00Z') }).total, 4);
});

test('top limits the frequent messages', () => {
  assert.deepEqual(summarize(entries, { top: 1 }).frequent, [{ message: 'request served', count: 3 }]);
});

test('formats a text summary', () => {
  const text = formatSummary(summarize(entries, { top: 1 }));
  assert.match(text, /^total: 8$/m);
  assert.match(text, /^ {4}3 {2}request served$/m);
});

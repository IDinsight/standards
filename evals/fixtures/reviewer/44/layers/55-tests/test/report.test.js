import assert from 'node:assert/strict';
import test from 'node:test';

import { LogError, formatMinutes, renderReport, summarize } from '../src/report.js';

test('summarize totals minutes per project', () => {
  const log = '2026-09-01 website 1h30m\n2026-09-01 admin 45m\n2026-09-02 website 2h\n';
  assert.deepEqual(summarize(log), [['admin', 45], ['website', 210]]);
});

test('summarize sorts by case-sensitive character order', () => {
  const log = '2026-09-01 beta 5m\n2026-09-01 Zeta 5m\n2026-09-01 alpha 5m\n';
  assert.deepEqual(summarize(log).map(([project]) => project), ['Zeta', 'alpha', 'beta']);
});

test('summarize ignores blank and comment lines and accepts CRLF', () => {
  const log = '# week 36\r\n\r\n2026-09-01 admin 10m\r\n   \r\n2026-09-02 admin 20m\r\n';
  assert.deepEqual(summarize(log), [['admin', 30]]);
});

test('summarize returns no rows for an empty log', () => {
  assert.deepEqual(summarize(''), []);
  assert.deepEqual(summarize('# nothing yet\n'), []);
});

test('summarize reports the 1-based line number of the first malformed line', () => {
  const log = '# header\n2026-09-01 admin 10m\n\n2026-09-02 admin 1h75m\n2026-09-03 admin oops\n';
  assert.throws(() => summarize(log), (error) => error instanceof LogError && error.lineNumber === 4);
});

test('formatMinutes renders hours and zero-padded minutes', () => {
  assert.equal(formatMinutes(0), '0:00');
  assert.equal(formatMinutes(65), '1:05');
  assert.equal(formatMinutes(600), '10:00');
  assert.equal(formatMinutes(1439), '23:59');
});

test('renderReport writes one tab-separated line per project', () => {
  assert.equal(renderReport([['admin', 45], ['website', 210]]), 'admin\t0:45\nwebsite\t3:30');
});

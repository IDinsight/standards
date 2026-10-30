import assert from 'node:assert/strict';
import test from 'node:test';

import { parseLine, parseLog } from '../src/parse.js';
import { formatSummary, totalsByProject } from '../src/summary.js';

test('parseLine reads date, hours, and project', () => {
  assert.deepEqual(parseLine('2026-09-01 3.5 api gateway'), { date: '2026-09-01', hours: 3.5, project: 'api gateway' });
});

test('parseLine defaults the project and skips comments', () => {
  assert.equal(parseLine('# note'), null);
  assert.equal(parseLine('2026-09-01 2').project, 'general');
});

test('parseLine rejects malformed entries', () => {
  assert.throws(() => parseLine('yesterday 2 api'), /Invalid entry/);
  assert.throws(() => parseLine('2026-09-01 -1 api'), /Invalid entry/);
});

test('totalsByProject sums and sorts by hours', () => {
  const rows = totalsByProject(parseLog('2026-09-01 1 b\n2026-09-01 2 a\n2026-09-02 2 b\n'));
  assert.deepEqual(rows, [{ project: 'b', hours: 3 }, { project: 'a', hours: 2 }]);
  assert.equal(formatSummary(rows).split('\n').length, 2);
});

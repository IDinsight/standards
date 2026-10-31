import assert from 'node:assert/strict';
import test from 'node:test';

import { tally } from '../src/tally.js';

test('counts lines by level', () => {
  const result = tally('t1 ERROR a\nt2 INFO b\nt3 INFO c\n');
  assert.deepEqual(result, { total: 3, counts: { ERROR: 1, WARN: 0, INFO: 2, DEBUG: 0 }, skipped: 0 });
});

test('ignores blank lines and counts unrecognized lines as skipped', () => {
  const result = tally('t1 WARN a\n\nnot a log line\nt2 notice b\n');
  assert.equal(result.total, 3);
  assert.equal(result.counts.WARN, 1);
  assert.equal(result.skipped, 2);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { backoffDelay } from '../src/backoff.js';

const settings = { baseDelayMs: 500, maxDelayMs: 8000 };

test('starts at the base delay and doubles for each attempt', () => {
  assert.deepEqual([1, 2, 3, 4].map((n) => backoffDelay(n, settings)), [500, 1000, 2000, 4000]);
});

test('never exceeds the maximum delay', () => {
  assert.equal(backoffDelay(5, settings), 8000);
  assert.equal(backoffDelay(12, settings), 8000);
  assert.equal(backoffDelay(2, { baseDelayMs: 3000, maxDelayMs: 5000 }), 5000);
});

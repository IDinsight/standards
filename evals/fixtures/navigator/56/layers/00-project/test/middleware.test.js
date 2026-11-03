import assert from 'node:assert/strict';
import test from 'node:test';

import { createLimiter } from '../src/middleware.js';

test('rejects a client with 429 once its bucket is empty', () => {
  let t = 0;
  const limit = createLimiter({ capacity: 1, refillPerInterval: 1, intervalMs: 1000, now: () => t });
  assert.deepEqual(limit('a'), { status: 200 });
  t = 400;
  assert.deepEqual(limit('a'), { status: 429, retryAfterMs: 600 });
  assert.deepEqual(limit('b'), { status: 200 });
});

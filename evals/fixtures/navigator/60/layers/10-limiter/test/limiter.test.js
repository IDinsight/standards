import assert from 'node:assert/strict';
import test from 'node:test';

import { RateLimiter } from '../src/limiter.js';

function clock(start = 0) {
  let t = start;
  const now = () => t;
  now.advance = (ms) => { t += ms; };
  return now;
}

test('limits each key independently', () => {
  const limiter = new RateLimiter({ capacity: 1, refillPerSecond: 1, now: clock() });
  assert.deepEqual(limiter.check('a'), { allowed: true, retryAfterMs: 0 });
  assert.deepEqual(limiter.check('a'), { allowed: false, retryAfterMs: 1000 });
  assert.deepEqual(limiter.check('b'), { allowed: true, retryAfterMs: 0 });
});

test('drops the oldest key when maxKeys is reached', () => {
  const limiter = new RateLimiter({ capacity: 1, refillPerSecond: 1, maxKeys: 2, now: clock() });
  limiter.check('a');
  limiter.check('b');
  limiter.check('c');
  assert.equal(limiter.buckets.has('a'), false);
  assert.equal(limiter.check('a').allowed, true);
});

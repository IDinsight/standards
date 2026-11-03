import assert from 'node:assert/strict';
import test from 'node:test';

import { createRateLimiter } from '../src/rateLimiter.js';

test('allows up to the limit and reports the remaining count', () => {
  const limiter = createRateLimiter({ limit: 3, now: () => 0 });
  const remaining = [1, 2, 3].map(() => limiter.check('kiosk-1').remaining);
  assert.deepEqual(remaining, [2, 1, 0]);
  const denied = limiter.check('kiosk-1');
  assert.equal(denied.allowed, false);
  assert.equal(denied.remaining, 0);
});

test('rounds Retry-After up to whole seconds', () => {
  let time = 0;
  const limiter = createRateLimiter({ limit: 1, now: () => time });
  assert.equal(limiter.check('kiosk-1').allowed, true);
  time = 500;
  const denied = limiter.check('kiosk-1');
  assert.equal(denied.allowed, false);
  assert.equal(denied.retryAfterSeconds, 60);
});

test('counts requests without a client id under one shared key', () => {
  const limiter = createRateLimiter({ limit: 1, now: () => 0 });
  assert.equal(limiter.check(undefined).allowed, true);
  assert.equal(limiter.check(null).allowed, false);
});

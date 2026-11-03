import assert from 'node:assert/strict';
import test from 'node:test';

import { TokenBucket } from '../src/limiter.js';

function fakeClock() {
  let t = 0;
  const now = () => t;
  now.advance = (ms) => {
    t += ms;
  };
  return now;
}

test('starts full and rejects once empty', () => {
  const now = fakeClock();
  const bucket = new TokenBucket({ capacity: 3, refillPerInterval: 3, intervalMs: 1000, now });
  assert.equal(bucket.tryTake(), true);
  assert.equal(bucket.tryTake(), true);
  assert.equal(bucket.tryTake(), true);
  assert.equal(bucket.tryTake(), false);
});

test('does not refill before a full interval has passed', () => {
  const now = fakeClock();
  const bucket = new TokenBucket({ capacity: 2, refillPerInterval: 2, intervalMs: 1000, now });
  bucket.tryTake(2);
  now.advance(999);
  assert.equal(bucket.tryTake(), false);
  now.advance(1);
  assert.equal(bucket.tryTake(), true);
});

test('refills whole intervals and caps at capacity', () => {
  const now = fakeClock();
  const bucket = new TokenBucket({ capacity: 5, refillPerInterval: 2, intervalMs: 100, now });
  bucket.tryTake(5);
  now.advance(250);
  assert.equal(bucket.tryTake(4), true);
  assert.equal(bucket.tryTake(), false);
  now.advance(10_000);
  assert.equal(bucket.tryTake(5), true);
  assert.equal(bucket.tryTake(), false);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { TokenBucket } from '../src/limiter.js';

function clock(start = 0) {
  let t = start;
  return { now: () => t, advance: (ms) => { t += ms; } };
}

test('allows up to capacity requests at once', () => {
  const c = clock();
  const bucket = new TokenBucket({ capacity: 3, refillPerSecond: 1, now: c.now });
  assert.equal(bucket.tryTake(), true);
  assert.equal(bucket.tryTake(), true);
  assert.equal(bucket.tryTake(), true);
  assert.equal(bucket.tryTake(), false);
});

test('refills in proportion to elapsed time', () => {
  const c = clock();
  const bucket = new TokenBucket({ capacity: 3, refillPerSecond: 1, now: c.now });
  while (bucket.tryTake()) { /* drain */ }
  c.advance(1000);
  assert.equal(bucket.tryTake(), true);
  assert.equal(bucket.tryTake(), false);
});

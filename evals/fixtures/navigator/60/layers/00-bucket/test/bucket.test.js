import assert from 'node:assert/strict';
import test from 'node:test';

import { TokenBucket } from '../src/bucket.js';

function clock(start = 0) {
  let t = start;
  const now = () => t;
  now.advance = (ms) => { t += ms; };
  return now;
}

test('starts full and allows up to capacity', () => {
  const now = clock();
  const bucket = new TokenBucket({ capacity: 3, refillPerSecond: 1, now });
  assert.equal(bucket.take(), true);
  assert.equal(bucket.take(), true);
  assert.equal(bucket.take(), true);
  assert.equal(bucket.take(), false);
});

test('refills at the configured rate without exceeding capacity', () => {
  const now = clock();
  const bucket = new TokenBucket({ capacity: 2, refillPerSecond: 2, now });
  bucket.take();
  bucket.take();
  now.advance(500);
  assert.equal(bucket.take(), true);
  assert.equal(bucket.take(), false);
  now.advance(10_000);
  bucket.refill();
  assert.equal(bucket.tokens, 2);
});

test('reports how long until a refused request would succeed', () => {
  const now = clock();
  const bucket = new TokenBucket({ capacity: 1, refillPerSecond: 0.5, now });
  bucket.take();
  assert.equal(bucket.retryAfterMs(), 2000);
});

test('rejects invalid settings', () => {
  assert.throws(() => new TokenBucket({ capacity: 0, refillPerSecond: 1 }), RangeError);
  assert.throws(() => new TokenBucket({ capacity: 1, refillPerSecond: 0 }), RangeError);
});

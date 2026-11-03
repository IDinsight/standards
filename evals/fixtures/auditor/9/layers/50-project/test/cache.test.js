import assert from 'node:assert/strict';
import test from 'node:test';

import { TtlCache } from '../src/cache.js';

function clock(start = 0) {
  let time = start;
  return { now: () => time, advance: (ms) => { time += ms; } };
}

test('returns a stored value before it expires', () => {
  const time = clock();
  const cache = new TtlCache({ ttlMs: 1000, now: time.now });
  cache.set('a', 1);
  time.advance(999);
  assert.equal(cache.get('a'), 1);
});

test('drops a value once its ttl has passed', () => {
  const time = clock();
  const cache = new TtlCache({ ttlMs: 1000, now: time.now });
  cache.set('a', 1);
  time.advance(1000);
  assert.equal(cache.get('a'), undefined);
});

test('delete removes a single key', () => {
  const cache = new TtlCache();
  cache.set('a', 1);
  cache.set('b', 2);
  cache.delete('a');
  assert.equal(cache.get('a'), undefined);
  assert.equal(cache.get('b'), 2);
});

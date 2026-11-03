import assert from 'node:assert/strict';
import test from 'node:test';

import { RateCache } from '../src/cache.js';

test('stores and returns values by key', () => {
  const cache = new RateCache();
  cache.set('USD/EUR', 0.92);
  assert.equal(cache.get('USD/EUR'), 0.92);
  assert.equal(cache.get('USD/GBP'), undefined);
});

test('prunes entries older than ttlSeconds once over maxEntries', () => {
  let now = 0;
  const cache = new RateCache({ ttlSeconds: 60, maxEntries: 2, now: () => now });
  cache.set('USD/EUR', 0.92);
  now = 61_000;
  cache.set('USD/GBP', 0.79);
  cache.set('USD/JPY', 151.2);
  assert.equal(cache.get('USD/EUR'), undefined);
  assert.equal(cache.size, 2);
});

test('drops the oldest entries when nothing has expired', () => {
  let now = 0;
  const cache = new RateCache({ ttlSeconds: 300, maxEntries: 2, now: () => now });
  cache.set('USD/EUR', 0.92);
  now = 1_000;
  cache.set('USD/GBP', 0.79);
  now = 2_000;
  cache.set('USD/JPY', 151.2);
  assert.equal(cache.get('USD/EUR'), undefined);
  assert.equal(cache.get('USD/GBP'), 0.79);
  assert.equal(cache.get('USD/JPY'), 151.2);
});

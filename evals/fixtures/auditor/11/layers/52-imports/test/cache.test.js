import assert from 'node:assert/strict';
import test from 'node:test';

import { Cache } from '../src/lib/cache.js';

test('returns stored values until they expire', () => {
  let clock = 0;
  const cache = new Cache({ ttlMs: 100, now: () => clock });
  cache.set('a', 1);
  assert.equal(cache.get('a'), 1);
  clock = 100;
  assert.equal(cache.get('a'), undefined);
});

test('delete removes a key', () => {
  const cache = new Cache();
  cache.set('a', 1);
  cache.delete('a');
  assert.equal(cache.get('a'), undefined);
});

test('deletePrefix removes only matching keys', () => {
  const cache = new Cache();
  cache.set('list:*', [1]);
  cache.set('list:home', [2]);
  cache.set('item:1', 1);
  cache.deletePrefix('list:');
  assert.equal(cache.get('list:*'), undefined);
  assert.equal(cache.get('list:home'), undefined);
  assert.equal(cache.get('item:1'), 1);
});

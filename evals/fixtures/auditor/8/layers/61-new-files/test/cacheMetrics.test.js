import assert from 'node:assert/strict';
import test from 'node:test';

import { MeteredInvoiceCache } from '../src/cacheMetrics.js';

test('counts hits and misses', () => {
  const cache = new MeteredInvoiceCache({ ttlMs: 1000, now: () => 0 });
  cache.get('INV-1');
  cache.set('INV-1', { id: 'INV-1' });
  cache.get('INV-1');
  cache.get('INV-1');
  assert.deepEqual(cache.stats(), { hits: 2, misses: 1, hitRate: 2 / 3 });
});

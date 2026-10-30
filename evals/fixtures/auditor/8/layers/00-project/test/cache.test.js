import assert from 'node:assert/strict';
import test from 'node:test';

import { InvoiceCache } from '../src/cache.js';

test('returns a stored value before it expires', () => {
  let clock = 0;
  const cache = new InvoiceCache({ ttlMs: 1000, now: () => clock });
  cache.set('INV-1', { id: 'INV-1' });
  clock = 999;
  assert.deepEqual(cache.get('INV-1'), { id: 'INV-1' });
});

test('drops a value once its ttl has passed', () => {
  let clock = 0;
  const cache = new InvoiceCache({ ttlMs: 1000, now: () => clock });
  cache.set('INV-1', { id: 'INV-1' });
  clock = 1000;
  assert.equal(cache.get('INV-1'), undefined);
});

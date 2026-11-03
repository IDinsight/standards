import assert from 'node:assert/strict';
import test from 'node:test';

import { buildQuote } from '../src/quote.js';

test('combines rate and fee into a quote', async () => {
  const provider = {
    rates: async () => ({ unitPrice: 4.1, currency: 'EUR' }),
    fees: async () => ({ amount: 1.25 }),
  };
  assert.deepEqual(await buildQuote(provider, { sku: 'A', region: 'eu', qty: 3 }), {
    sku: 'A', region: 'eu', qty: 3, currency: 'EUR', subtotal: 12.3, fee: 1.25, total: 13.55,
  });
});

test('a failing provider call fails the quote', async () => {
  const provider = {
    rates: async () => ({ unitPrice: 1, currency: 'EUR' }),
    fees: async () => { throw new Error('unavailable'); },
  };
  await assert.rejects(buildQuote(provider, { sku: 'A', region: 'eu', qty: 1 }), /unavailable/);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { quote } from '../src/quote.js';

test('quotes subtotal, shipping, and total with the bundled settings', () => {
  const result = quote({ items: [{ unitPrice: 12.5, quantity: 2, weightKg: 0.75 }] });
  assert.deepEqual(result, { currency: 'EUR', subtotal: 25, shipping: 6.9, total: 31.9 });
});

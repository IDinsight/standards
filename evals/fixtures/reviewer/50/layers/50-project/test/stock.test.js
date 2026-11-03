import assert from 'node:assert/strict';
import test from 'node:test';

import { lowStock } from '../src/stock.js';

test('lists items at or below the default threshold', () => {
  const items = [
    { sku: 'A-1', name: 'USB-C cable', category: 'cables', quantity: 2 },
    { sku: 'A-2', name: 'HDMI cable', category: 'cables', quantity: 5 },
    { sku: 'M-1', name: 'Monitor arm', category: 'mounts', quantity: 9 },
  ];
  assert.deepEqual(lowStock(items).map((item) => item.sku), ['A-1', 'A-2']);
});

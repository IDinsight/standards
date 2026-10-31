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

test('uses the configured threshold for a category', () => {
  const items = [
    { sku: 'M-1', name: 'Monitor arm', category: 'mounts', quantity: 4 },
    { sku: 'C-1', name: 'Patch cable', category: 'cables', quantity: 12 },
    { sku: 'C-2', name: 'Power cable', category: 'cables', quantity: 25 },
  ];
  assert.deepEqual(lowStock(items, { cables: 20 }).map((item) => item.sku), ['M-1', 'C-1']);
});

test('falls back to the default threshold for unconfigured categories', () => {
  const items = [
    { sku: 'P-1', name: 'Projector', category: 'displays', quantity: 1 },
    { sku: 'K-1', name: 'Keyboard', category: 'peripherals', quantity: 5 },
    { sku: 'K-2', name: 'Mouse', category: 'peripherals', quantity: 6 },
  ];
  assert.deepEqual(lowStock(items, { displays: 2 }).map((item) => item.sku), ['P-1', 'K-1']);
});

test('a category threshold of 0 lists only out-of-stock items', () => {
  const items = [
    { sku: 'S-1', name: 'Fabric swatch', category: 'samples', quantity: 0 },
    { sku: 'S-2', name: 'Paint chip', category: 'samples', quantity: 3 },
  ];
  assert.deepEqual(lowStock(items, { samples: 0 }).map((item) => item.sku), ['S-1']);
});

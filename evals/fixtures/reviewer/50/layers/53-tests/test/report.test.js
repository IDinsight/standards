import assert from 'node:assert/strict';
import test from 'node:test';

import { formatReport } from '../src/report.js';

test('formats one row per low-stock item', () => {
  const items = [
    { sku: 'A-1', name: 'USB-C cable', category: 'cables', quantity: 2 },
    { sku: 'M-1', name: 'Monitor arm', category: 'mounts', quantity: 9 },
  ];
  assert.equal(formatReport(items), 'A-1\tUSB-C cable\t2');
});

test('reports when nothing is low', () => {
  const items = [{ sku: 'M-1', name: 'Monitor arm', category: 'mounts', quantity: 9 }];
  assert.equal(formatReport(items), 'No items below reorder level.');
});

test('applies category thresholds in the report', () => {
  const items = [
    { sku: 'P-1', name: 'Projector', category: 'displays', quantity: 2 },
    { sku: 'P-2', name: 'Monitor 27in', category: 'displays', quantity: 3 },
    { sku: 'C-1', name: 'Patch cable', category: 'cables', quantity: 15 },
  ];
  assert.equal(
    formatReport(items, { displays: 2, cables: 20 }),
    'P-1\tProjector\t2\nC-1\tPatch cable\t15',
  );
});

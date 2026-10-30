import assert from 'node:assert/strict';
import test from 'node:test';

import { exportOrders } from '../src/export.js';

const orders = [
  {
    id: 'A-100',
    customer: 'Lin',
    totalCents: 1999,
    placedAt: '2026-09-01T10:15:00+02:00',
    lines: [{ sku: 'MUG-01', quantity: 1, priceCents: 1999 }],
  },
  {
    id: 'A-101',
    customer: 'Okafor',
    totalCents: 500,
    placedAt: '2026-09-02T08:00:00Z',
    lines: [{ sku: 'PEN-04', quantity: 2, priceCents: 250 }],
  },
];

const serialize = (order) => JSON.stringify({
  id: order.id,
  total: (order.totalCents / 100).toFixed(2),
  placedAt: new Date(order.placedAt).toISOString(),
});

const parseLines = (output) => output.trimEnd().split('\n').map((line) => JSON.parse(line));

test('writes each order as a JSON line with a decimal total and UTC timestamp', () => {
  const [first, second] = parseLines(exportOrders(orders, { serialize }));
  assert.equal(first.total, '19.99');
  assert.equal(first.placedAt, '2026-09-01T08:15:00.000Z');
  assert.equal(second.total, '5.00');
  assert.equal(second.placedAt, '2026-09-02T08:00:00.000Z');
});

test('keeps one line per order in input order', () => {
  const output = exportOrders(orders, { serialize });
  assert.ok(output.endsWith('\n'));
  assert.deepEqual(parseLines(output).map((order) => order.id), ['A-100', 'A-101']);
});

test('returns empty output for no orders', () => {
  assert.equal(exportOrders([], { serialize }), '');
});

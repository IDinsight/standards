import assert from 'node:assert/strict';
import test from 'node:test';

import { totals } from '../src/pricing.js';

const items = [
  { name: 'Notebook', unitPrice: 450, quantity: 2 },
  { name: 'Pen', unitPrice: 120, quantity: 5 },
];
const may = new Date('2026-05-01T12:00:00Z');
const july = new Date('2026-07-01T12:00:00Z');

test('totals adds tax to the subtotal', () => {
  assert.deepEqual(totals(items), { subtotal: 1500, discount: 0, tax: 120, total: 1620 });
});

test('totals honours a custom tax rate', () => {
  assert.deepEqual(totals(items, { taxRate: 0 }), { subtotal: 1500, discount: 0, tax: 0, total: 1500 });
});

test('a percent code is taken off before tax', () => {
  assert.deepEqual(totals(items, { code: 'SPRING10', today: may }), { subtotal: 1500, discount: 150, tax: 108, total: 1458 });
});

test('a fixed code is taken off before tax', () => {
  assert.deepEqual(totals(items, { code: 'welcome5', today: may }), { subtotal: 1500, discount: 500, tax: 80, total: 1080 });
});

test('an expired code is ignored', () => {
  assert.deepEqual(totals(items, { code: 'SPRING10', today: july }), { subtotal: 1500, discount: 0, tax: 120, total: 1620 });
});

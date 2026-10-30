import assert from 'node:assert/strict';
import test from 'node:test';

import { discountAmount, findDiscount } from '../src/discounts.js';

const may = new Date('2026-05-01T12:00:00Z');
const july = new Date('2026-07-01T12:00:00Z');

test('codes are matched case-insensitively', () => {
  assert.equal(findDiscount(' spring10 ', may).kind, 'percent');
});

test('expired codes are not found', () => {
  assert.equal(findDiscount('SPRING10', july), null);
});

test('unknown and empty codes are not found', () => {
  assert.equal(findDiscount('NOPE', may), null);
  assert.equal(findDiscount('', may), null);
  assert.equal(findDiscount(null, may), null);
});

test('percent discounts are rounded to whole cents', () => {
  assert.equal(discountAmount(findDiscount('STAFF20', may), 1499), 300);
});

test('fixed discounts take a flat amount', () => {
  assert.equal(discountAmount(findDiscount('WELCOME5', may), 1500), 500);
});

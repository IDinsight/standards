import assert from 'node:assert/strict';
import test from 'node:test';

import { lateFeeCents } from '../src/billing/lateFee.js';
import { buildStatement } from '../src/billing/statement.js';

const invoice = (overrides = {}) => ({
  number: 'INV-0801', dueDate: '2026-08-01', totalCents: 12000, payments: [], ...overrides,
});

test('no fee within the 14-day grace period', () => {
  assert.equal(lateFeeCents(invoice(), '2026-08-15'), 0);
});

test('fee applies from day 15 past due', () => {
  assert.equal(lateFeeCents(invoice(), '2026-08-16'), 180);
});

test('no fee on a paid invoice', () => {
  assert.equal(lateFeeCents(invoice({ payments: [{ amountCents: 12000 }] }), '2026-09-30'), 0);
});

test('rounds half a cent up', () => {
  // 1.5% of 45.00 is 0.675
  assert.equal(lateFeeCents(invoice({ payments: [{ amountCents: 7500 }] }), '2026-09-30'), 68);
});

test('rounds below half a cent down', () => {
  // 1.5% of 44.90 is 0.6735
  assert.equal(lateFeeCents(invoice({ payments: [{ amountCents: 7510 }] }), '2026-09-30'), 67);
});

test('statement adds late fees to the total', () => {
  const statement = buildStatement({ name: 'Harbor Supply' }, [invoice()], '2026-08-31');
  assert.equal(statement.lines[0].lateFeeCents, 180);
  assert.equal(statement.totalCents, 12180);
});

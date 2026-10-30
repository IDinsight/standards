import assert from 'node:assert/strict';
import test from 'node:test';

import { formatPrice, renderBillingSummary } from '../src/billing/summary.js';

const account = { planName: 'Pro', monthlyPriceCents: 2900, renewsOn: '2026-09-30' };

test('renders the billing summary lines', () => {
  assert.equal(renderBillingSummary(account), [
    '# Billing',
    'Plan: Pro',
    '$29.00 / month',
    'Renews on 2026-09-30',
    '[Cancel plan]',
  ].join('\n'));
});

test('formats prices with two decimals', () => {
  assert.equal(formatPrice(500), '$5.00');
  assert.equal(formatPrice(1999), '$19.99');
});

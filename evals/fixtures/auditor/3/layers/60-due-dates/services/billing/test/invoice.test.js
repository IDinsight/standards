import assert from 'node:assert/strict';
import test from 'node:test';

import { createLedger } from '@tally/ledger';

import { createInvoice, postInvoice } from '../src/index.js';

test('invoice total is the plan price', () => {
  const invoice = createInvoice({ customerId: 'c1', planId: 'team', issuedOn: '2026-03-01' });
  assert.equal(invoice.totalCents, 2900);
  assert.deepEqual(invoice.lines, [{ description: 'Plan team', cents: 2900 }]);
});

test('invoice is due 30 days after issue by default', () => {
  const invoice = createInvoice({ customerId: 'c1', planId: 'starter', issuedOn: '2026-03-01' });
  assert.equal(invoice.dueOn, '2026-03-31');
});

test('payment terms set the due date', () => {
  const invoice = createInvoice({ customerId: 'c1', planId: 'starter', issuedOn: '2026-03-01', termsDays: 14 });
  assert.equal(invoice.dueOn, '2026-03-15');
});

test('unknown plans are rejected', () => {
  assert.throws(() => createInvoice({ customerId: 'c1', planId: 'gold', issuedOn: '2026-03-01' }), /unknown plan/);
});

test('posting an invoice adds to the customer receivable', () => {
  const ledger = createLedger();
  postInvoice(ledger, createInvoice({ customerId: 'c1', planId: 'business', issuedOn: '2026-03-01' }));
  assert.equal(ledger.balance('receivable:c1'), 9900);
});

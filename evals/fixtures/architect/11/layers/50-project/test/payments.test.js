import assert from 'node:assert/strict';
import test from 'node:test';

import { createDraft, issueInvoice } from '../src/invoices.js';
import { balanceCents, recordPayment } from '../src/payments.js';
import { createStore } from '../src/store.js';

function issued(store) {
  const invoice = createDraft(store, {
    customerId: 'c-1',
    lines: [{ description: 'Audit', quantity: 1, unitPriceCents: 50000 }],
  }, '2026-09-01');
  issueInvoice(store, invoice.number, '2026-09-01');
  return invoice;
}

test('full payment marks the invoice paid', () => {
  const store = createStore();
  const invoice = issued(store);
  recordPayment(store, invoice.number, 20000, '2026-09-10');
  assert.equal(balanceCents(store, invoice.number), 30000);
  assert.equal(invoice.status, 'issued');
  recordPayment(store, invoice.number, 30000, '2026-09-15');
  assert.equal(invoice.status, 'paid');
});

test('overpayment is rejected', () => {
  const store = createStore();
  const invoice = issued(store);
  assert.throws(() => recordPayment(store, invoice.number, 60000, '2026-09-10'), /exceeds balance/);
  assert.equal(balanceCents(store, invoice.number), 50000);
});

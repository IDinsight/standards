import assert from 'node:assert/strict';
import test from 'node:test';

import { InvoiceStore } from '../src/invoices.ts';

const acme = { customer: 'Acme', amountCents: 1200, issuedOn: '2026-09-01' };

test('numbers invoices sequentially', () => {
  const store = new InvoiceStore();
  const first = store.create(acme);
  const second = store.create({ ...acme, customer: 'Globex' });
  assert.equal(first.id, 'INV-0001');
  assert.equal(second.id, 'INV-0002');
  assert.equal(first.status, 'draft');
});

test('moves an invoice from draft to sent to paid', () => {
  const store = new InvoiceStore();
  const { id } = store.create(acme);
  assert.equal(store.markSent(id).status, 'sent');
  assert.equal(store.markPaid(id).status, 'paid');
});

test('refuses to pay a draft invoice', () => {
  const store = new InvoiceStore();
  const { id } = store.create(acme);
  assert.throws(() => store.markPaid(id), /is draft, not sent/);
});

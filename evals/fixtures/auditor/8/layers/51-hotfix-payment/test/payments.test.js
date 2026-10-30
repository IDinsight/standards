import assert from 'node:assert/strict';
import test from 'node:test';

import { InvoiceCache } from '../src/cache.js';
import { InvoiceService } from '../src/invoices.js';
import { recordPayment } from '../src/payments.js';
import { InvoiceStore } from '../src/store.js';

const invoice = {
  id: 'INV-7',
  customer: 'Harbor Supply',
  dueDate: '2026-09-01',
  status: 'open',
  paidCents: 500,
  lineItems: [
    { description: 'Pallets', quantity: 3, unitCents: 1200 },
    { description: 'Delivery', quantity: 1, unitCents: 800 },
  ],
};

const serviceFor = (rows) => new InvoiceService(new InvoiceStore(rows), new InvoiceCache({ now: () => 0 }));

test('adds the payment to the stored invoice', () => {
  const service = serviceFor([invoice]);
  assert.equal(recordPayment(service, 'INV-7', 1000), 1500);
  assert.equal(service.store.get('INV-7').paidCents, 1500);
});

test('rejects payments on void invoices', () => {
  const service = serviceFor([{ ...invoice, status: 'void' }]);
  assert.throws(() => recordPayment(service, 'INV-7', 1000), /void/);
});

test('a recorded payment shows on the next read', () => {
  const service = serviceFor([invoice]);
  assert.equal(service.getInvoice('INV-7').balanceCents, 3900);
  recordPayment(service, 'INV-7', 1000);
  assert.equal(service.getInvoice('INV-7').balanceCents, 2900);
});

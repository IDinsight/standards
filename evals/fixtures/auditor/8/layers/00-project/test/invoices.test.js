import assert from 'node:assert/strict';
import test from 'node:test';

import { InvoiceCache } from '../src/cache.js';
import { InvoiceService } from '../src/invoices.js';
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

test('summarizes total and balance', () => {
  const service = new InvoiceService(new InvoiceStore([invoice]), new InvoiceCache({ now: () => 0 }));
  const summary = service.getInvoice('INV-7');
  assert.equal(summary.totalCents, 4400);
  assert.equal(summary.balanceCents, 3900);
});

test('serves repeat reads from the cache', () => {
  const store = new InvoiceStore([invoice]);
  const service = new InvoiceService(store, new InvoiceCache({ now: () => 0 }));
  service.getInvoice('INV-7');
  service.getInvoice('INV-7');
  assert.equal(store.reads, 1);
});

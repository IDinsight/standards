import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/handlers.ts';
import { InvoiceStore } from '../src/invoices.ts';

const acme = { customer: 'Acme', amountCents: 1200, issuedOn: '2026-09-01' };

test('creates and fetches an invoice', () => {
  const ctx = { store: new InvoiceStore() };
  const created = handle(ctx, 'POST', '/invoices', { ...acme, customer: ' Acme ' });
  assert.equal(created.status, 201);
  assert.deepEqual(handle(ctx, 'GET', '/invoices/INV-0001'), {
    status: 200,
    body: { id: 'INV-0001', status: 'draft', ...acme },
  });
});

test('lists invoices', () => {
  const ctx = { store: new InvoiceStore() };
  handle(ctx, 'POST', '/invoices', acme);
  handle(ctx, 'POST', '/invoices', { ...acme, customer: 'Globex' });
  const listed = handle(ctx, 'GET', '/invoices');
  assert.equal(listed.status, 200);
  assert.equal((listed.body as unknown[]).length, 2);
});

test('returns 404 for unknown invoices and paths', () => {
  const ctx = { store: new InvoiceStore() };
  assert.equal(handle(ctx, 'GET', '/invoices/INV-0042').status, 404);
  assert.equal(handle(ctx, 'GET', '/customers').status, 404);
});

test('rejects a missing customer', () => {
  const ctx = { store: new InvoiceStore() };
  assert.deepEqual(handle(ctx, 'POST', '/invoices', { amountCents: 100 }), {
    status: 400,
    body: { error: 'customer is required' },
  });
});

test('rejects a non-positive amount', () => {
  const ctx = { store: new InvoiceStore() };
  const reply = handle(ctx, 'POST', '/invoices', { ...acme, amountCents: 0 });
  assert.equal(reply.status, 400);
  assert.equal(ctx.store.list().length, 0);
});

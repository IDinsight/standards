import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/handlers.ts';
import { InvoiceStore } from '../src/invoices.ts';
import { DEFAULT_TTL_MS, ShareLinks } from '../src/share-links.ts';

function setup() {
  const store = new InvoiceStore();
  const invoice = store.create({ customer: 'Acme', amountCents: 1200, issuedOn: '2026-09-01' });
  return { store, links: new ShareLinks(store), invoice };
}

test('resolves a link to its invoice before expiry', () => {
  const { links, invoice } = setup();
  const link = links.create(invoice.id, 1_000);
  assert.equal(links.resolve(link.token, 1_000 + DEFAULT_TTL_MS - 1)?.id, invoice.id);
});

test('a link stops resolving once it expires', () => {
  const { links, invoice } = setup();
  const link = links.create(invoice.id, 1_000);
  assert.equal(links.resolve(link.token, 1_000 + DEFAULT_TTL_MS), undefined);
});

test('a revoked link stops resolving', () => {
  const { links, invoice } = setup();
  const link = links.create(invoice.id, 1_000);
  assert.equal(links.revoke(link.token), true);
  assert.equal(links.resolve(link.token, 1_000), undefined);
  assert.equal(links.revoke(link.token), false);
});

test('refuses links for unknown invoices', () => {
  const { links } = setup();
  assert.throws(() => links.create('INV-0099', 1_000), /unknown invoice/);
});

test('share routes create, resolve, and revoke a link', () => {
  const { store, links, invoice } = setup();
  const ctx = { store, links, now: () => 5_000 };
  const shared = handle(ctx, 'POST', '/invoices/' + invoice.id + '/share');
  assert.equal(shared.status, 201);
  const { token } = shared.body as { token: string };
  assert.equal(handle(ctx, 'GET', '/shared/' + token).status, 200);
  assert.equal(handle(ctx, 'DELETE', '/shared/' + token).status, 204);
  assert.equal(handle(ctx, 'GET', '/shared/' + token).status, 404);
});

test('share route returns 404 for unknown invoices', () => {
  const { store, links } = setup();
  const ctx = { store, links, now: () => 5_000 };
  assert.equal(handle(ctx, 'POST', '/invoices/INV-0099/share').status, 404);
});

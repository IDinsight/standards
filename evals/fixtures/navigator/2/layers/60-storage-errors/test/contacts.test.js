import assert from 'node:assert/strict';
import test from 'node:test';

import { route } from '../src/router.js';
import { MemoryStore } from '../src/store.js';

const post = (body) => ({ method: 'POST', path: '/contacts', body });

test('creates a normalized contact', async () => {
  const store = new MemoryStore();
  const result = await route(post({ name: '  Ada   Lovelace ', email: ' ADA@Example.org ', phone: '(555) 010-2030' }), { store });
  assert.equal(result.status, 201);
  assert.deepEqual(result.body, { id: 1, name: 'Ada Lovelace', email: 'ada@example.org', phone: '5550102030' });
});

test('rejects an invalid contact without saving it', async () => {
  const store = new MemoryStore();
  const result = await route(post({ name: '', email: 'not-an-email' }), { store });
  assert.equal(result.status, 400);
  assert.deepEqual(result.body.errors, ['name is required', 'email must be a valid address']);
  assert.equal(store.rows.size, 0);
});

test('returns 503 when the store rejects the write', async () => {
  const store = new MemoryStore({ limit: 0 });
  const result = await route(post({ name: 'Ada', email: 'ada@example.org' }), { store });
  assert.equal(result.status, 503);
  assert.equal(store.rows.size, 0);
});

test('reads a saved contact back', async () => {
  const store = new MemoryStore();
  await route(post({ name: 'Grace', email: 'grace@example.org' }), { store });
  const result = await route({ method: 'GET', path: '/contacts/1', body: {} }, { store });
  assert.equal(result.status, 200);
  assert.equal(result.body.name, 'Grace');
});

test('unknown route returns 404', async () => {
  const result = await route({ method: 'DELETE', path: '/contacts/1', body: {} }, { store: new MemoryStore() });
  assert.equal(result.status, 404);
});

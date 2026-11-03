import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../src/records.js';
import { handle } from '../src/routes.js';

const admin = { id: 1, role: 'admin' };
const member = { id: 2, role: 'member' };

function seeded() {
  return createStore([
    { name: 'Ada Lovelace', email: 'ada@example.org', status: 'active', createdAt: '2026-01-04' },
    { name: 'Alan Turing', email: 'alan@example.org', status: 'archived', createdAt: '2026-02-11' },
  ]);
}

test('lists records with a status filter', () => {
  const response = handle(seeded(), member, { method: 'GET', path: '/records', query: { status: 'active' } });
  assert.equal(response.status, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.total, 1);
  assert.equal(body.items[0].name, 'Ada Lovelace');
});

test('returns a single record', () => {
  const response = handle(seeded(), member, { method: 'GET', path: '/records/2' });
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.body).email, 'alan@example.org');
});

test('only administrators can add records', () => {
  const store = seeded();
  const body = { name: 'Grace Hopper', email: 'grace@example.org', status: 'active', createdAt: '2026-03-09' };
  assert.equal(handle(store, member, { method: 'POST', path: '/records', body }).status, 403);
  const created = handle(store, admin, { method: 'POST', path: '/records', body });
  assert.equal(created.status, 201);
  assert.equal(JSON.parse(created.body).id, 3);
});

test('requires a signed-in user', () => {
  assert.equal(handle(seeded(), null, { method: 'GET', path: '/records' }).status, 401);
});

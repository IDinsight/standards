import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/router.js';
import { ClientStore } from '../src/store.js';

const admin = { id: 1, role: 'admin' };
const member = { id: 2, role: 'member' };

function seed() {
  return new ClientStore([
    { id: 1, name: 'Northwind Traders', email: 'orders@northwind.example', phone: '555-0101', archived: false },
    { id: 2, name: 'Contoso Ltd', email: 'hello@contoso.example', phone: '555-0102', archived: false },
    { id: 3, name: 'Fabrikam', email: 'info@fabrikam.example', phone: '555-0103', archived: true },
  ]);
}

test('members list active clients by id and name', () => {
  const res = handle({ method: 'GET', path: '/clients', actor: member }, { store: seed() });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, [{ id: 1, name: 'Northwind Traders' }, { id: 2, name: 'Contoso Ltd' }]);
});

test('signed-out requests cannot list clients', () => {
  const res = handle({ method: 'GET', path: '/clients', actor: null }, { store: seed() });
  assert.equal(res.status, 403);
});

test('members can read a client record', () => {
  const res = handle({ method: 'GET', path: '/clients/2', actor: member }, { store: seed() });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'hello@contoso.example');
});

test('unknown client returns 404', () => {
  const res = handle({ method: 'GET', path: '/clients/99', actor: member }, { store: seed() });
  assert.equal(res.status, 404);
});

test('only admins can delete clients', () => {
  const store = seed();
  assert.equal(handle({ method: 'DELETE', path: '/clients/1', actor: member }, { store }).status, 403);
  assert.equal(handle({ method: 'DELETE', path: '/clients/1', actor: admin }, { store }).status, 204);
  assert.equal(store.get(1), null);
});

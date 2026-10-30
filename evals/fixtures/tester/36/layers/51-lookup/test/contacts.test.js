import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../src/contacts.js';
import { route } from '../src/routes.js';

test('adding a contact trims the name and lowercases the email', () => {
  const store = createStore();
  const contact = store.add({ name: '  Ana Lima ', email: 'Ana@Example.org' });
  assert.deepEqual(contact, { id: 1, name: 'Ana Lima', email: 'ana@example.org' });
});

test('GET /contacts lists every contact', () => {
  const store = createStore([
    { name: 'Ana Lima', email: 'ana@example.org' },
    { name: 'Joan Park', email: 'joan@example.org' },
  ]);
  const { status, body } = route(store, 'GET', '/contacts');
  assert.equal(status, 200);
  assert.equal(body.results.length, 2);
});

test('GET /contacts/:id returns 404 for an unknown id', () => {
  const store = createStore([{ name: 'Ana Lima', email: 'ana@example.org' }]);
  assert.equal(route(store, 'GET', '/contacts/1').status, 200);
  const { status, body } = route(store, 'GET', '/contacts/7');
  assert.equal(status, 404);
  assert.deepEqual(body, { error: 'not found' });
});

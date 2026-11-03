import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../src/contacts.js';
import { route } from '../src/routes.js';

const seed = [
  { name: 'Ana Lima', email: 'ana@example.org' },
  { name: 'Joan Park', email: 'joan@example.org' },
  { name: 'Bruno Costa', email: 'bruno@example.org' },
];

test('name search matches part of a name regardless of case', () => {
  const store = createStore(seed);
  const { status, body } = route(store, 'GET', '/contacts/search?name=AN');
  assert.equal(status, 200);
  assert.deepEqual(body.results.map((contact) => contact.name), ['Ana Lima', 'Joan Park']);
});

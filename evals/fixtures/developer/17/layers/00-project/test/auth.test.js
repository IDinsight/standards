import assert from 'node:assert/strict';
import test from 'node:test';

import { authenticate, HttpError, requireAdmin } from '../src/auth.js';
import { createStore } from '../src/store.js';

const store = createStore({
  users: [{ id: 'u1', token: 'tok-1', admin: true }, { id: 'u2', token: 'tok-2', admin: false }],
});

test('authenticate returns the user for a valid bearer token', () => {
  assert.equal(authenticate(store, { authorization: 'Bearer tok-2' }).id, 'u2');
});

test('authenticate rejects a missing or unknown token with 401', () => {
  for (const headers of [{}, { authorization: 'Bearer nope' }, { authorization: 'tok-1' }]) {
    assert.throws(() => authenticate(store, headers), (error) => error instanceof HttpError && error.status === 401);
  }
});

test('requireAdmin rejects non-admin users with 403', () => {
  assert.doesNotThrow(() => requireAdmin(store.users[0]));
  assert.throws(() => requireAdmin(store.users[1]), (error) => error.status === 403);
});

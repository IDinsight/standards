import assert from 'node:assert/strict';
import test from 'node:test';

import { createSignup } from '../src/handlers/signup.js';
import { SignupStore } from '../src/store.js';

test('stores a valid signup', () => {
  const store = new SignupStore();
  const result = createSignup(store, { name: ' Ada ', email: 'ADA@example.org' });
  assert.equal(result.status, 201);
  assert.deepEqual(result.body, { id: 1, name: 'Ada', email: 'ada@example.org' });
  assert.equal(store.count(), 1);
});

test('rejects an invalid signup without storing it', () => {
  const store = new SignupStore();
  const result = createSignup(store, { name: '', email: 'not-an-email' });
  assert.equal(result.status, 400);
  assert.deepEqual(result.body.errors, ['name is required', 'email is invalid']);
  assert.equal(store.count(), 0);
});

test('rejects a duplicate email', () => {
  const store = new SignupStore();
  createSignup(store, { name: 'Ada', email: 'ada@example.org' });
  const result = createSignup(store, { name: 'Ada L', email: 'Ada@Example.org' });
  assert.equal(result.status, 409);
  assert.equal(store.count(), 1);
});

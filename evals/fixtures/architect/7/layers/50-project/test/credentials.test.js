import assert from 'node:assert/strict';
import test from 'node:test';

import { CredentialStore } from '../src/credentials.js';

test('issue returns a key that resolves to the account', () => {
  const store = new CredentialStore();
  const key = store.issue('acct-1');
  assert.match(key, /^dk_[0-9a-f]{48}$/);
  assert.equal(store.lookup(key).accountId, 'acct-1');
});

test('issue refuses a second key for the same account', () => {
  const store = new CredentialStore();
  store.issue('acct-1');
  assert.throws(() => store.issue('acct-1'), /already has a key/);
});

test('rotate replaces the previous key', () => {
  const store = new CredentialStore();
  const first = store.issue('acct-1');
  const second = store.rotate('acct-1');
  assert.notEqual(first, second);
  assert.equal(store.lookup(first), null);
  assert.equal(store.lookup(second).accountId, 'acct-1');
});

test('lookup ignores values without the key prefix', () => {
  const store = new CredentialStore();
  assert.equal(store.lookup('not-a-key'), null);
  assert.equal(store.lookup(undefined), null);
});

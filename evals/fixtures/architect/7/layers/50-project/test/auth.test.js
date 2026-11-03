import assert from 'node:assert/strict';
import test from 'node:test';

import { AuthError, authenticate } from '../src/auth.js';
import { CredentialStore } from '../src/credentials.js';

test('authenticate resolves a bearer key to its account', () => {
  const store = new CredentialStore();
  const key = store.issue('acct-7');
  assert.equal(authenticate({ authorization: `Bearer ${key}` }, store), 'acct-7');
});

test('authenticate rejects a missing or malformed header', () => {
  const store = new CredentialStore();
  assert.throws(() => authenticate({}, store), AuthError);
  assert.throws(() => authenticate({ authorization: 'Basic abc' }, store), AuthError);
});

test('authenticate rejects an unknown key', () => {
  const store = new CredentialStore();
  assert.throws(() => authenticate({ authorization: 'Bearer dk_0000' }, store), AuthError);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { CredentialStore } from '../src/credentials.js';
import { createKey, getAccount, rotateKey } from '../src/routes.js';

const bearer = (key) => ({ authorization: `Bearer ${key}` });

test('createKey provisions one key per account', () => {
  const store = new CredentialStore();
  const created = createKey(store, 'acct-1');
  assert.equal(created.status, 201);
  assert.equal(getAccount(store, bearer(created.body.key)).body.accountId, 'acct-1');
  assert.equal(createKey(store, 'acct-1').status, 409);
});

test('rotateKey returns a new key and the old one stops working', () => {
  const store = new CredentialStore();
  const { key: oldKey } = createKey(store, 'acct-1').body;
  const rotated = rotateKey(store, bearer(oldKey));
  assert.equal(rotated.status, 200);
  assert.equal(getAccount(store, bearer(rotated.body.key)).status, 200);
  assert.equal(getAccount(store, bearer(oldKey)).status, 401);
});

test('rotateKey requires a valid key', () => {
  const store = new CredentialStore();
  assert.equal(rotateKey(store, {}).status, 401);
  assert.equal(rotateKey(store, bearer('dk_unknown')).status, 401);
});

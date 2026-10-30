import assert from 'node:assert/strict';
import test from 'node:test';

import { getAccount } from '../src/handlers.js';
import { sign } from '../src/session.js';

const keys = { k1: 'test-secret-one' };
const store = { find: async (id) => (id === 'acct-7' ? { id, balance: 120 } : null) };
const withToken = (token) => ({ headers: { authorization: `Bearer ${token}` } });

test('returns the account for a valid session', async () => {
  const response = await getAccount(withToken(sign({ sub: 'acct-7' }, keys, 'k1')), { store, keys });
  assert.deepEqual(response, { status: 200, body: { id: 'acct-7', balance: 120 } });
});

test('rejects a request without a session', async () => {
  const response = await getAccount({ headers: {} }, { store, keys });
  assert.equal(response.status, 401);
});

test('returns 404 for an unknown account', async () => {
  const response = await getAccount(withToken(sign({ sub: 'acct-9' }, keys, 'k1')), { store, keys });
  assert.equal(response.status, 404);
});

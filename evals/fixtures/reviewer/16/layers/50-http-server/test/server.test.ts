import assert from 'node:assert/strict';
import { test } from 'node:test';

import { userFromHeaders } from '../src/http/server.ts';

test('userFromHeaders reads the gateway headers', () => {
  assert.deepEqual(
    userFromHeaders({ 'x-user-id': '7', 'x-user-name': 'Ada', 'x-user-role': 'admin' }),
    { id: 7, name: 'Ada', role: 'admin' },
  );
});

test('userFromHeaders ignores an unknown role or a missing id', () => {
  assert.equal(userFromHeaders({ 'x-user-id': '7', 'x-user-name': 'Ada', 'x-user-role': 'owner' }), null);
  assert.equal(userFromHeaders({ 'x-user-name': 'Ada', 'x-user-role': 'admin' }), null);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { userFromGateway } from '../src/auth/gateway.ts';

test('userFromGateway builds the user the gateway forwarded', () => {
  assert.deepEqual(
    userFromGateway({ 'x-gateway-user-id': '1', 'x-gateway-user': 'Ada', 'x-gateway-role': 'admin' }),
    { id: 1, name: 'Ada', role: 'admin' },
  );
});

test('userFromGateway returns null when no user was forwarded', () => {
  assert.equal(userFromGateway({}), null);
});

test('userFromGateway rejects an incomplete identity or an unknown role', () => {
  assert.throws(() => userFromGateway({ 'x-gateway-user': 'Ada', 'x-gateway-role': 'admin' }), { status: 401 });
  assert.throws(
    () => userFromGateway({ 'x-gateway-user-id': '1', 'x-gateway-user': 'Ada', 'x-gateway-role': 'owner' }),
    { status: 401 },
  );
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { authorize, requireAdmin } from '../src/auth/authorize.js';

const admin = { id: 1, name: 'Ada', role: 'admin' };
const viewer = { id: 3, name: 'Vik', role: 'viewer' };

test('authorize rejects a request without a user', () => {
  assert.throws(() => authorize(null, ['viewer']), { status: 401 });
});

test('authorize rejects a role that is not allowed', () => {
  assert.throws(() => authorize(viewer, ['admin', 'editor']), { status: 403 });
});

test('requireAdmin returns the admin user', () => {
  assert.equal(requireAdmin(admin), admin);
});

test('requireAdmin rejects non-admin users', () => {
  assert.throws(() => requireAdmin(viewer), { status: 403 });
});

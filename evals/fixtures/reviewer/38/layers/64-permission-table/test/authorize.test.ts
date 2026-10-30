import assert from 'node:assert/strict';
import { test } from 'node:test';

import { authorize, can, requireAdmin, requirePermission } from '../src/auth/authorize.ts';
import type { User } from '../src/auth/users.ts';

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };

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

test('can grants records:manage to administrators only', () => {
  assert.equal(can(admin, 'records:manage'), true);
  assert.equal(can(editor, 'records:manage'), false);
  assert.equal(can(viewer, 'records:manage'), false);
  assert.equal(can(viewer, 'records:read'), true);
  assert.equal(can(null, 'records:read'), false);
});

test('requirePermission rejects a missing user and a missing permission', () => {
  assert.throws(() => requirePermission(null, 'records:read'), { status: 401 });
  assert.throws(() => requirePermission(editor, 'records:manage'), { status: 403 });
  assert.equal(requirePermission(editor, 'records:read'), editor);
});

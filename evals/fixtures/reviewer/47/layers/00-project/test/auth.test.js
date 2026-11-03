import assert from 'node:assert/strict';
import test from 'node:test';

import { can } from '../src/auth.js';

test('admin can manage users', () => {
  assert.equal(can({ role: 'admin' }, 'users:manage'), true);
});

test('manager and member cannot manage users', () => {
  assert.equal(can({ role: 'manager' }, 'users:manage'), false);
  assert.equal(can({ role: 'member' }, 'users:manage'), false);
});

test('unknown permissions are denied', () => {
  assert.equal(can({ role: 'admin' }, 'reports:delete'), false);
});

test('anonymous users are denied', () => {
  assert.equal(can(null, 'records:read'), false);
});

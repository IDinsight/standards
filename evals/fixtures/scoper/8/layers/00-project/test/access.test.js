import assert from 'node:assert/strict';
import test from 'node:test';

import { canEdit, canView } from '../src/access.js';

const report = { id: 1, teamId: 'ops', ownerId: 'ada' };

test('team members can view their team reports', () => {
  assert.equal(canView({ id: 'cy', teamId: 'ops', role: 'member' }, report), true);
});

test('members of other teams cannot view', () => {
  assert.equal(canView({ id: 'bo', teamId: 'sales', role: 'member' }, report), false);
});

test('admins can view any report', () => {
  assert.equal(canView({ id: 'root', teamId: 'it', role: 'admin' }, report), true);
});

test('nobody can view without a user', () => {
  assert.equal(canView(null, report), false);
});

test('only the owner or an admin can edit', () => {
  assert.equal(canEdit({ id: 'ada', teamId: 'ops', role: 'member' }, report), true);
  assert.equal(canEdit({ id: 'cy', teamId: 'ops', role: 'member' }, report), false);
  assert.equal(canEdit({ id: 'root', teamId: 'it', role: 'admin' }, report), true);
});

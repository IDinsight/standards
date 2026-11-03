import assert from 'node:assert/strict';
import test from 'node:test';

import { listAllWorkspaces, listMyWorkspaces } from '../src/routes/workspaces.js';
import { createStore } from '../src/store.js';

const store = createStore({
  users: [{ id: 'u1', token: 'tok-1', admin: true }, { id: 'u2', token: 'tok-2', admin: false }],
  workspaces: [
    { id: 'w1', name: 'Design', ownerId: 'u1', memberIds: ['u1', 'u2'], guestIds: [] },
    { id: 'w2', name: 'Finance', ownerId: 'u1', memberIds: ['u1'], guestIds: ['u2'] },
  ],
});

const as = (token) => ({ headers: { authorization: `Bearer ${token}` }, params: {}, query: {} });

test('listMyWorkspaces returns only workspaces the caller is a member of', () => {
  assert.deepEqual(listMyWorkspaces(store, as('tok-2')), { status: 200, body: [{ id: 'w1', name: 'Design' }] });
});

test('listAllWorkspaces is limited to admins', () => {
  assert.equal(listAllWorkspaces(store, as('tok-2')).status, 403);
  assert.equal(listAllWorkspaces(store, as('tok-1')).body.length, 2);
});

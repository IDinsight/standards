import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/routes.js';
import { addReport, addUser, createStore } from '../src/store.js';

function setup() {
  const store = createStore();
  const ada = addUser(store, { id: 'ada', teamId: 'ops', role: 'member' });
  const bo = addUser(store, { id: 'bo', teamId: 'sales', role: 'member' });
  const report = addReport(store, { teamId: 'ops', title: 'Q3 incidents', body: 'Two outages, both resolved.', ownerId: 'ada' });
  return { store, ada, bo, report };
}

test('report routes require a signed-in user', () => {
  const { store, report } = setup();
  const response = handle(store, { method: 'GET', path: `/reports/${report.id}`, user: null });
  assert.equal(response.status, 401);
});

test('a team member can read the team report', () => {
  const { store, ada, report } = setup();
  const response = handle(store, { method: 'GET', path: `/reports/${report.id}`, user: ada });
  assert.equal(response.status, 200);
  assert.equal(response.body.title, 'Q3 incidents');
});

test('a member of another team is refused', () => {
  const { store, bo, report } = setup();
  assert.equal(handle(store, { method: 'GET', path: `/reports/${report.id}`, user: bo }).status, 403);
});

test('the list contains only reports the user can read', () => {
  const { store, ada, bo } = setup();
  assert.equal(handle(store, { method: 'GET', path: '/reports', user: ada }).body.length, 1);
  assert.equal(handle(store, { method: 'GET', path: '/reports', user: bo }).body.length, 0);
});

test('an unknown report is 404', () => {
  const { store, ada } = setup();
  assert.equal(handle(store, { method: 'GET', path: '/reports/99', user: ada }).status, 404);
});

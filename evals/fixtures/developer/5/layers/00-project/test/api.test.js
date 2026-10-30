import assert from 'node:assert/strict';
import test from 'node:test';

import { route } from '../src/router.js';
import { ReportStore } from '../src/store.js';

const ada = { id: 'ada' };
const bob = { id: 'bob' };

test('owner creates and reads a report', () => {
  const store = new ReportStore();
  const created = route(store, { method: 'POST', path: '/reports', user: ada, body: { title: ' Q3 ', body: 'numbers' } });
  assert.equal(created.status, 201);
  const read = route(store, { method: 'GET', path: `/reports/${created.body.id}`, user: ada });
  assert.equal(read.status, 200);
  assert.equal(read.body.title, 'Q3');
});

test('another user cannot read the report', () => {
  const store = new ReportStore();
  const { body } = route(store, { method: 'POST', path: '/reports', user: ada, body: { title: 'Q3' } });
  assert.equal(route(store, { method: 'GET', path: `/reports/${body.id}`, user: bob }).status, 403);
});

test('anonymous requests need a user', () => {
  assert.equal(route(new ReportStore(), { method: 'GET', path: '/reports' }).status, 401);
});

test('unknown report is not found', () => {
  assert.equal(route(new ReportStore(), { method: 'GET', path: '/reports/42', user: ada }).status, 404);
});

test('title is required', () => {
  assert.equal(route(new ReportStore(), { method: 'POST', path: '/reports', user: ada, body: { title: '  ' } }).status, 400);
});

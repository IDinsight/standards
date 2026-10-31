import assert from 'node:assert/strict';
import test from 'node:test';

import { exportHandler } from '../src/export.js';
import { createStore } from '../src/records.js';

const store = createStore([
  { id: 1, title: 'Water point survey', owner: 'field-ops', updatedAt: '2026-08-02' },
]);
const exportRecords = exportHandler(store);

test('member is refused with 403', () => {
  assert.equal(exportRecords({ user: { id: 7, roles: ['member'] } }).status, 403);
});

test('viewer is refused with 403', () => {
  assert.equal(exportRecords({ user: { id: 8, roles: ['viewer', 'reports'] } }).status, 403);
});

test('a refused response contains no record data', () => {
  const response = exportRecords({ user: { id: 7, roles: ['member'] } });
  assert.doesNotMatch(response.body, /Water point survey/);
  assert.equal(response.headers['content-type'], 'application/json');
});

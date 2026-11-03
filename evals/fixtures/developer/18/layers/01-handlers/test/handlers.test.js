import assert from 'node:assert/strict';
import test from 'node:test';

import { getRecord, patchRecord, postRecord } from '../src/handlers.js';
import { AdminRecordStore } from '../src/records.js';

test('POST creates a record', () => {
  const store = new AdminRecordStore();
  const response = postRecord(store, { name: 'Ada', email: 'ada@example.org', role: 'admin' });
  assert.equal(response.status, 201);
  assert.deepEqual(getRecord(store, response.body.id), { status: 200, body: response.body });
});

test('POST with an invalid email returns 400', () => {
  const response = postRecord(new AdminRecordStore(), { name: 'Ada', email: 'nope' });
  assert.deepEqual(response, { status: 400, body: { error: 'email is invalid' } });
});

test('GET and PATCH of a missing record return 404', () => {
  const store = new AdminRecordStore();
  assert.equal(getRecord(store, 3).status, 404);
  assert.equal(patchRecord(store, 3, { name: 'X' }).status, 404);
});

test('PATCH changes the role', () => {
  const store = new AdminRecordStore();
  const { body } = postRecord(store, { name: 'Ada', email: 'ada@example.org' });
  assert.equal(patchRecord(store, body.id, { role: 'owner' }).body.role, 'owner');
});

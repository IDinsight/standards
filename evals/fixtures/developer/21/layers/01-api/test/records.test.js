import assert from 'node:assert/strict';
import test from 'node:test';

import { getRecord, patchRecord, postRecord } from '../src/api.js';
import { RecordStore } from '../src/store.js';

const NOW = new Date('2026-09-01T10:00:00Z');

test('creates a record with normalized fields', () => {
  const store = new RecordStore();
  const [status, body] = postRecord(store, { id: 'a1', name: ' Ada ', email: 'ADA@Example.org' }, NOW);
  assert.equal(status, 201);
  assert.deepEqual(body, {
    id: 'a1',
    name: 'Ada',
    email: 'ada@example.org',
    role: 'admin',
    createdAt: '2026-09-01T10:00:00.000Z',
  });
});

test('rejects a record without an email', () => {
  const [status, body] = postRecord(new RecordStore(), { id: 'a2', name: 'Lin' }, NOW);
  assert.equal(status, 400);
  assert.equal(body.error, 'email is required');
});

test('updates only the provided fields', () => {
  const store = new RecordStore();
  postRecord(store, { id: 'a3', name: 'Sam', email: 'sam@example.org' }, NOW);
  const [status, body] = patchRecord(store, 'a3', { role: 'owner' });
  assert.equal(status, 200);
  assert.equal(body.role, 'owner');
  assert.equal(body.name, 'Sam');
  assert.equal(body.email, 'sam@example.org');
});

test('returns 404 for an unknown record', () => {
  assert.deepEqual(getRecord(new RecordStore(), 'missing'), [404, { error: 'not found' }]);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { applyAdminUpdate, createAdminRecord } from '../src/adminRecords.js';
import { AdminStore } from '../src/store.js';

const NOW = new Date('2026-09-01T12:00:00Z');

test('new records start with no suspension reason', () => {
  const record = createAdminRecord({ id: 7, displayName: ' Ada ', email: 'ADA@Example.org' });
  assert.deepEqual(record, {
    id: 7,
    displayName: 'Ada',
    email: 'ada@example.org',
    role: 'member',
    suspendedReason: null,
    updatedAt: null,
  });
});

test('updates trim text and clear blank optional fields', () => {
  const record = createAdminRecord({ id: 1, displayName: 'Lin', email: 'lin@example.org' });
  const suspended = applyAdminUpdate(record, { suspendedReason: '  chargeback  ' }, NOW);
  assert.equal(suspended.suspendedReason, 'chargeback');
  assert.equal(suspended.updatedAt, '2026-09-01T12:00:00.000Z');
  assert.equal(applyAdminUpdate(suspended, { suspendedReason: '   ' }, NOW).suspendedReason, null);
  assert.equal(applyAdminUpdate(suspended, { suspendedReason: null }, NOW).suspendedReason, null);
});

test('unknown fields and invalid roles are rejected', () => {
  const record = createAdminRecord({ id: 2, displayName: 'Sam', email: 'sam@example.org' });
  assert.throws(() => applyAdminUpdate(record, { nickname: 'S' }), /Unknown field: nickname/);
  assert.throws(() => applyAdminUpdate(record, { role: 'superuser' }), /role must be one of/);
});

test('store applies updates to the saved record', () => {
  const store = new AdminStore();
  store.add({ id: 3, displayName: 'Kim', email: 'kim@example.org' });
  store.update(3, { role: 'admin' }, NOW);
  assert.equal(store.get(3).role, 'admin');
  assert.equal(store.update(99, { role: 'admin' }, NOW), null);
});

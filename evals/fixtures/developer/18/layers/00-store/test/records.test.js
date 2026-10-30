import assert from 'node:assert/strict';
import test from 'node:test';

import { AdminRecordStore, ValidationError } from '../src/records.js';

test('create trims the name and lowercases the email', () => {
  const store = new AdminRecordStore();
  const record = store.create({ name: '  Grace Hopper ', email: 'Grace@Example.org', role: 'admin' });
  assert.deepEqual(record, { id: 1, name: 'Grace Hopper', email: 'grace@example.org', role: 'admin' });
});

test('role defaults to support', () => {
  const store = new AdminRecordStore();
  assert.equal(store.create({ name: 'Ada', email: 'ada@example.org' }).role, 'support');
});

test('unknown roles are rejected', () => {
  const store = new AdminRecordStore();
  assert.throws(() => store.create({ name: 'Ada', email: 'ada@example.org', role: 'root' }), ValidationError);
});

test('update keeps the id and ignores unknown fields', () => {
  const store = new AdminRecordStore();
  const { id } = store.create({ name: 'Ada', email: 'ada@example.org' });
  const updated = store.update(id, { role: 'owner', id: 99, extra: true });
  assert.deepEqual(updated, { id, name: 'Ada', email: 'ada@example.org', role: 'owner' });
  assert.deepEqual(store.get(id), updated);
});

test('update of a missing record returns null', () => {
  assert.equal(new AdminRecordStore().update(5, { name: 'X' }), null);
});

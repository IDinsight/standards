import assert from 'node:assert/strict';
import test from 'node:test';

import { createEntry, ValidationError } from '../src/entries.js';
import { EntryStore } from '../src/store.js';

test('saves a valid entry and adds to the daily total', () => {
  const store = new EntryStore();
  const saved = createEntry(store, { project: ' Website ', date: '2026-09-21', hours: 3.5 });
  assert.deepEqual(saved, { id: 1, project: 'Website', date: '2026-09-21', hours: 3.5 });
  assert.equal(store.totalFor('2026-09-21'), 3.5);
});

test('rejects an entry with too many hours', () => {
  const store = new EntryStore();
  assert.throws(
    () => createEntry(store, { project: 'Website', date: '2026-09-21', hours: 30 }),
    ValidationError,
  );
  assert.equal(store.totalFor('2026-09-21'), 0);
  assert.equal(store.entries.size, 0);
});

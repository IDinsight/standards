import assert from 'node:assert/strict';
import test from 'node:test';

import { createRecord, updateRecord } from '../src/record.js';

test('createRecord trims and defaults', () => {
  const record = createRecord({ id: 1, title: ' Q3 audit ', owner: ' sam ' });
  assert.deepEqual(record, { id: 1, title: 'Q3 audit', owner: 'sam', status: 'open', reviewedAt: null });
});

test('updateRecord sets and clears nullable fields', () => {
  const record = createRecord({ id: 1, title: 'A', owner: 'b' });
  const reviewed = updateRecord(record, { reviewedAt: '2026-09-01' });
  assert.equal(reviewed.reviewedAt, '2026-09-01');
  assert.equal(updateRecord(reviewed, { reviewedAt: null }).reviewedAt, null);
});

test('updateRecord rejects unknown fields and empty required fields', () => {
  const record = createRecord({ id: 1, title: 'A', owner: 'b' });
  assert.throws(() => updateRecord(record, { color: 'red' }), /Unknown field/);
  assert.throws(() => updateRecord(record, { title: null }), /cannot be empty/);
});

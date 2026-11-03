import assert from 'node:assert/strict';
import test from 'node:test';

import { toCsv } from '../src/csv.js';

test('uses the first row keys when no columns are given', () => {
  const csv = toCsv([{ id: '1', name: 'Ada' }, { id: '2', name: 'Grace' }]);
  assert.equal(csv, 'id,name\n1,Ada\n2,Grace');
});

test('quotes fields that contain commas, quotes, or line breaks', () => {
  assert.equal(toCsv([{ note: 'a, "b"\nc' }]), 'note\n"a, ""b""\nc"');
});

test('returns an empty string for no rows', () => {
  assert.equal(toCsv([]), '');
});

test('writes only the requested columns in the requested order', () => {
  const rows = [{ id: '1', name: 'Ada', email: 'ada@example.org' }];
  assert.equal(toCsv(rows, { columns: ['email', 'id'] }), 'email,id\nada@example.org,1');
});

test('leaves a missing requested field empty', () => {
  const rows = [{ id: '1', name: 'Ada' }, { id: '2' }];
  assert.equal(toCsv(rows, { columns: ['id', 'name'] }), 'id,name\n1,Ada\n2,');
});

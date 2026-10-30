import assert from 'node:assert/strict';
import test from 'node:test';

import { toCsv } from '../src/export.js';
import { createStore } from '../src/records.js';
import { handle } from '../src/routes.js';

const admin = { id: 1, role: 'admin' };
const member = { id: 2, role: 'member' };

function seeded() {
  return createStore([
    { name: 'Ada Lovelace', email: 'ada@example.org', status: 'active', createdAt: '2026-01-04' },
    { name: 'Hopper, Grace', email: 'grace@example.org', status: 'active', createdAt: '2026-03-09' },
    { name: 'Alan Turing', email: 'alan@example.org', status: 'archived', createdAt: '2026-02-11' },
  ]);
}

test('toCsv writes a header row and quotes commas, quotes, and line breaks', () => {
  const csv = toCsv([{ a: 'plain', b: 'has, comma' }, { a: 'say "hi"', b: 'two\nlines' }], ['a', 'b']);
  assert.equal(csv, 'a,b\r\nplain,"has, comma"\r\n"say ""hi""","two\nlines"\r\n');
});

test('toCsv leaves missing values empty', () => {
  assert.equal(toCsv([{ a: 'x' }], ['a', 'b']), 'a,b\r\nx,\r\n');
});

test('administrators download every record as CSV', () => {
  const response = handle(seeded(), admin, { method: 'GET', path: '/records/export' });
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'text/csv; charset=utf-8');
  assert.equal(response.headers['content-disposition'], 'attachment; filename="records.csv"');
  const lines = response.body.trimEnd().split('\r\n');
  assert.equal(lines[0], 'id,name,email,status,createdAt');
  assert.equal(lines.length, 4);
  assert.equal(lines[2], '2,"Hopper, Grace",grace@example.org,active,2026-03-09');
});

test('the status filter limits the export', () => {
  const response = handle(seeded(), admin, { method: 'GET', path: '/records/export', query: { status: 'archived' } });
  assert.deepEqual(response.body.trimEnd().split('\r\n'), [
    'id,name,email,status,createdAt',
    '3,Alan Turing,alan@example.org,archived,2026-02-11',
  ]);
});

test('other users cannot export records', () => {
  const response = handle(seeded(), member, { method: 'GET', path: '/records/export' });
  assert.equal(response.status, 403);
  assert.doesNotMatch(response.body, /example\.org/);
});

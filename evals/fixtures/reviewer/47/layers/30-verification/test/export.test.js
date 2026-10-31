import assert from 'node:assert/strict';
import test from 'node:test';

import { toCsv } from '../src/csv.js';
import { listRecords } from '../src/records.js';
import { exportRecordsHandler } from '../src/routes.js';

const admin = { id: 1, role: 'admin' };
const member = { id: 7, role: 'member' };

test('admin export returns a header row and one line per record', () => {
  const response = exportRecordsHandler(admin);
  assert.equal(response.status, 200);
  assert.match(response.headers['content-type'], /^text\/csv/);
  const lines = response.body.trimEnd().split('\r\n');
  assert.equal(lines[0], 'id,title,owner,notes,updated_at');
  assert.equal(lines.length, listRecords().length + 1);
});

test('fields with commas, quotes, and line breaks are quoted per RFC 4180', () => {
  const csv = toCsv(['a', 'b', 'c'], [{ a: 'x,y', b: 'say "hi"', c: 'two\nlines' }]);
  assert.equal(csv, 'a,b,c\r\n"x,y","say ""hi""","two\nlines"\r\n');
});

test('plain values and missing fields are written as-is', () => {
  assert.equal(toCsv(['a', 'b'], [{ a: 'plain' }]), 'a,b\r\nplain,\r\n');
});

test('export body keeps the stored values intact', () => {
  const body = exportRecordsHandler(admin).body;
  assert.ok(body.includes('"Vendor review, Q3"'));
  assert.ok(body.includes('"Marked ""urgent"" by finance"'));
});

test('member export is refused with 403 and no record data', () => {
  const response = exportRecordsHandler(member);
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
});

test('anonymous export is refused', () => {
  assert.equal(exportRecordsHandler(null).status, 403);
});

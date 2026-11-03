import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../src/app.js';
import { csvCell, toCsv } from '../src/csv.js';

const root = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin = { id: 1, name: 'Ada', role: 'admin' };
const editor = { id: 2, name: 'Eli', role: 'editor' };
const viewer = { id: 3, name: 'Vik', role: 'viewer' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');

function exportRequest(query, user = admin) {
  return { method: 'POST', path: '/records/export', query, user };
}

test('plain values are written unquoted', () => {
  assert.equal(csvCell('Insurance renewal 2026'), 'Insurance renewal 2026');
  assert.equal(csvCell(42), '42');
});

test('values containing a comma are quoted', () => {
  assert.equal(csvCell('Lease agreement, Building B'), '"Lease agreement, Building B"');
});

test('double quotes inside a value are doubled and the value is quoted', () => {
  assert.equal(csvCell('Q2 "priority" accounts review'), '"Q2 ""priority"" accounts review"');
});

test('values containing line breaks are quoted', () => {
  assert.equal(csvCell('first line\nsecond line'), '"first line\nsecond line"');
  assert.equal(csvCell('first line\r\nsecond line'), '"first line\r\nsecond line"');
});

test('toCsv writes a header row and one CRLF-terminated row per record', () => {
  const records = [
    { id: 7, title: 'Budget, draft', owner: 'li', status: 'active', createdAt: '2026-01-05T09:00:00Z' },
    { id: 9, title: 'Archive index', owner: 'dana', status: 'archived', createdAt: '2026-02-11T15:30:00Z' },
  ];
  assert.equal(
    toCsv(records),
    'id,title,owner,status,createdAt\r\n'
      + '7,"Budget, draft",li,active,2026-01-05T09:00:00Z\r\n'
      + '9,Archive index,dana,archived,2026-02-11T15:30:00Z\r\n',
  );
});

test('an administrator exports the filtered records to a CSV file', () => {
  const exportDir = path.join(root, 'by-owner');
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest({ owner: 'dana' }));

  assert.equal(response.status, 201);
  assert.equal(response.headers['content-type'], 'text/csv; charset=utf-8');
  assert.equal(response.headers['content-disposition'], 'attachment; filename="records-20260924T090000Z.csv"');
  const written = readFileSync(path.join(exportDir, 'records-20260924T090000Z.csv'), 'utf8');
  assert.equal(
    written,
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
  assert.equal(response.body, written);
});

test('an export without filters contains every record in id order', () => {
  const exportDir = path.join(root, 'all');
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest({}));

  assert.equal(response.status, 201);
  assert.deepEqual(readdirSync(exportDir), ['records-20260924T090000Z.csv']);
  const rows = response.body.trimEnd().split('\r\n');
  assert.equal(rows[0], 'id,title,owner,status,createdAt');
  assert.deepEqual(rows.slice(1).map((row) => row.split(',')[0]), ['1', '2', '3', '4', '5', '6']);
});

test('export requests without an administrator are denied and write no file', () => {
  const exportDir = path.join(root, 'denied');
  const app = createApp({ exportDir, now: fixedNow });
  const denied = [
    [null, 401, 'authentication required'],
    [viewer, 403, 'forbidden'],
    [editor, 403, 'forbidden'],
  ];

  for (const [user, status, error] of denied) {
    const response = app.handle(exportRequest({ owner: 'dana' }, user));
    assert.equal(response.status, status);
    assert.deepEqual(JSON.parse(response.body), { error });
    assert.equal(existsSync(exportDir), false);
  }
});

import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, mock, test } from 'node:test';

import { createApp } from '../../src/app.ts';
import type { User } from '../../src/auth/users.ts';
import type { AppRequest } from '../../src/http/messages.ts';
import type { RecordItem } from '../../src/records/store.ts';

// Runs the export end to end against the seeded app, writing into a
// temporary folder that is removed afterwards.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');

function exportRequest(query: Record<string, string>, user: User | null = admin): AppRequest {
  return { method: 'POST', path: '/records/export', query, user };
}

// Stands in for the CSV serializer, so these tests check which records reach
// it and what happens to its output.
function fakeSerializer() {
  return mock.fn((records: readonly RecordItem[]) => `${records.map((record) => record.id).join(';')}\r\n`);
}

test('an administrator exports the filtered records to a CSV file', () => {
  const exportDir = path.join(root, 'by-owner');
  const serialize = fakeSerializer();
  const response = createApp({ exportDir, now: fixedNow, serialize }).handle(exportRequest({ owner: 'dana' }));

  assert.equal(response.status, 201);
  assert.equal(response.headers['content-type'], 'text/csv; charset=utf-8');
  assert.equal(response.headers['content-disposition'], 'attachment; filename="records-20260924T090000Z.csv"');
  assert.equal(serialize.mock.callCount(), 1);
  assert.deepEqual(serialize.mock.calls[0].arguments[0].map((record: RecordItem) => record.id), [1, 3]);
  const written = readFileSync(path.join(exportDir, 'records-20260924T090000Z.csv'), 'utf8');
  assert.equal(written, '1;3\r\n');
  assert.equal(response.body, written);
});

test('an export without filters covers every record in id order', () => {
  const exportDir = path.join(root, 'all');
  const serialize = fakeSerializer();
  const response = createApp({ exportDir, now: fixedNow, serialize }).handle(exportRequest({}));

  assert.equal(response.status, 201);
  assert.deepEqual(readdirSync(exportDir), ['records-20260924T090000Z.csv']);
  assert.deepEqual(serialize.mock.calls[0].arguments[0].map((record: RecordItem) => record.id), [1, 2, 3, 4, 5, 6]);
});

test('export requests without an administrator are denied and write no file', () => {
  const exportDir = path.join(root, 'denied');
  const serialize = fakeSerializer();
  const app = createApp({ exportDir, now: fixedNow, serialize });
  const denied: [User | null, number, string][] = [
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
  assert.equal(serialize.mock.callCount(), 0);
});

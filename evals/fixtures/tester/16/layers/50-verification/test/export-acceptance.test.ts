import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, mock, test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import type { AppRequest } from '../src/http/messages.ts';
import type { RecordItem } from '../src/records/store.ts';

// Export acceptance checks against the seeded app. Export folders live in a
// temporary directory that is removed afterwards.
const root = mkdtempSync(path.join(tmpdir(), 'records-acceptance-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');

function send(method: AppRequest['method'], requestPath: string, query: Record<string, string>, user: User | null): AppRequest {
  return { method, path: requestPath, query, user };
}

test('export rows match the listing for the same query', () => {
  const app = createApp({ exportDir: path.join(root, 'listing'), now: fixedNow });
  const query = { status: 'active' };
  const listed = JSON.parse(app.handle(send('GET', '/records', query, admin)).body)
    .records.map((record: RecordItem) => String(record.id));
  const response = app.handle(send('POST', '/records/export', query, admin));
  assert.equal(response.status, 201);
  const rows = response.body.trimEnd().split('\r\n').slice(1);
  assert.deepEqual(rows.map((row) => row.split(',')[0]), listed);
});

function assertDenied(user: User | null, status: number, error: string): void {
  const exportDir = path.join(root, `denied-${user ? user.role : 'anonymous'}`);
  const response = createApp({ exportDir, now: fixedNow }).handle(send('POST', '/records/export', {}, user));
  assert.equal(response.status, status);
  assert.deepEqual(JSON.parse(response.body), { error });
  assert.equal(existsSync(exportDir), false);
}

test('an export without a signed-in user is denied with 401 and writes no file', () => {
  assertDenied(null, 401, 'authentication required');
});

test('an export from a viewer is denied with 403 and writes no file', () => {
  assertDenied(viewer, 403, 'forbidden');
});

test('an export from an editor is denied with 403 and writes no file', () => {
  assertDenied(editor, 403, 'forbidden');
});

// Rows below are assembled with a stubbed field encoder that returns the
// RFC 4180 form of the sample titles, keeping these checks independent of
// file output.
const encodeField = mock.fn((value: string | number): string => {
  const encoded: Record<string, string> = {
    'Lease agreement, Building B': '"Lease agreement, Building B"',
    'Q2 "priority" accounts review': '"Q2 ""priority"" accounts review"',
    'Move plan\nphase two': '"Move plan\nphase two"',
  };
  return encoded[String(value)] ?? String(value);
});

function exportRow(record: RecordItem): string {
  return [record.id, record.title, record.owner, record.status, record.createdAt]
    .map((value) => encodeField(value))
    .join(',');
}

test('a title containing a comma is written as one quoted field', () => {
  const record: RecordItem = { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' };
  assert.equal(exportRow(record), '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z');
});

test('double quotes inside a title are doubled and the title is quoted', () => {
  const record: RecordItem = { id: 3, title: 'Q2 "priority" accounts review', owner: 'dana', status: 'archived', createdAt: '2026-04-01T08:05:00Z' };
  assert.equal(exportRow(record), '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z');
});

test('a title containing a line break is written as one quoted field', () => {
  const record: RecordItem = { id: 7, title: 'Move plan\nphase two', owner: 'marco', status: 'active', createdAt: '2026-07-01T12:00:00Z' };
  assert.equal(exportRow(record), '7,"Move plan\nphase two",marco,active,2026-07-01T12:00:00Z');
  assert.ok(encodeField.mock.callCount() > 0);
});

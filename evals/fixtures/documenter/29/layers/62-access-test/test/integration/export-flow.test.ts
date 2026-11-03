import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../../src/app.ts';
import type { User } from '../../src/auth/users.ts';
import type { AppRequest } from '../../src/http/messages.ts';

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

test('a failed export leaves no file in the export folder', () => {
  const exportDir = path.join(root, 'failed');
  const response = createApp({ exportDir, now: () => new Date('not a date') }).handle(exportRequest({}));

  assert.equal(response.status, 500);
  assert.deepEqual(JSON.parse(response.body), { error: 'internal error' });
  assert.deepEqual(existsSync(exportDir) ? readdirSync(exportDir) : [], []);
});

test('export requests without an administrator are denied and write no file', () => {
  const exportDir = path.join(root, 'denied');
  const app = createApp({ exportDir, now: fixedNow });
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
});

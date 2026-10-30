import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import type { AppRequest } from '../src/http/messages.ts';

// Each test gets its own export folder under a temporary root that is removed
// afterwards.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
const TOKEN = '0123456789abcdef0123456789abcdef';

function appIn(name: string) {
  const exportDir = path.join(root, name);
  return { exportDir, app: createApp({ exportDir, newToken: () => TOKEN }) };
}

function createExport(user: User | null, query: Record<string, string> = {}): AppRequest {
  return { method: 'POST', path: '/records/export', query, user };
}

function download(url: string, user: User | null = null): AppRequest {
  const [pathname, search] = url.split('?');
  return { method: 'GET', path: pathname, query: Object.fromEntries(new URLSearchParams(search)), user };
}

test('an administrator creates an export of the filtered records', () => {
  const { exportDir, app } = appIn('create');
  const response = app.handle(createExport(admin, { owner: 'dana' }));

  assert.equal(response.status, 201);
  assert.deepEqual(JSON.parse(response.body), { count: 2, url: `/exports/download?token=${TOKEN}` });
  assert.deepEqual(readdirSync(exportDir), [`${TOKEN}.csv`]);
});

test('the download link returns the CSV without signing in', () => {
  const { app } = appIn('download');
  const { url } = JSON.parse(app.handle(createExport(admin, { owner: 'dana' })).body);
  const response = app.handle(download(url));

  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'text/csv; charset=utf-8');
  assert.equal(response.headers['content-disposition'], 'attachment; filename="records.csv"');
  assert.equal(
    response.body,
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
});

test('editors, viewers, and requests without a user cannot create exports', () => {
  const { exportDir, app } = appIn('denied');
  const denied: [User | null, number][] = [[null, 401], [viewer, 403], [editor, 403]];

  for (const [user, status] of denied) {
    assert.equal(app.handle(createExport(user)).status, status);
  }
  assert.equal(existsSync(exportDir), false);
});

test('an unknown or malformed token returns 404', () => {
  const { app } = appIn('missing');
  app.handle(createExport(admin));

  assert.equal(app.handle(download('/exports/download?token=ffffffffffffffffffffffffffffffff')).status, 404);
  assert.equal(app.handle(download('/exports/download?token=../package')).status, 404);
  assert.equal(app.handle(download('/exports/download')).status, 404);
});

import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';

// Each test writes into its own folder under a temporary root that is removed
// afterwards.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');

test('exportRecords writes the filtered records for an administrator', async () => {
  const exportDir = path.join(root, 'by-owner');
  const result = await createApp({ exportDir, now: fixedNow }).exporter.exportRecords(admin, { owner: 'dana' });

  assert.equal(result.fileName, 'records-20260924T090000Z.csv');
  assert.equal(result.path, path.join(exportDir, 'records-20260924T090000Z.csv'));
  assert.equal(result.count, 2);
  const written = readFileSync(result.path, 'utf8');
  assert.equal(
    written,
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
  assert.equal(result.csv, written);
});

test('exportRecords without filters exports every record in id order', async () => {
  const exportDir = path.join(root, 'all');
  const result = await createApp({ exportDir, now: fixedNow }).exporter.exportRecords(admin);

  assert.equal(result.count, 6);
  assert.deepEqual(readdirSync(exportDir), ['records-20260924T090000Z.csv']);
  const rows = result.csv.trimEnd().split('\r\n');
  assert.equal(rows[0], 'id,title,owner,status,createdAt');
  assert.deepEqual(rows.slice(1).map((row) => row.split(',')[0]), ['1', '2', '3', '4', '5', '6']);
});

test('exportRecords rejects a request without a user and writes nothing', async () => {
  const exportDir = path.join(root, 'anonymous');
  const { exporter } = createApp({ exportDir, now: fixedNow });

  await assert.rejects(exporter.exportRecords(null, {}), { status: 401, message: 'authentication required' });
  assert.equal(existsSync(exportDir), false);
});

test('exportRecords rejects editors and viewers and writes nothing', async () => {
  const exportDir = path.join(root, 'denied');
  const { exporter } = createApp({ exportDir, now: fixedNow });

  for (const user of [editor, viewer]) {
    await assert.rejects(exporter.exportRecords(user, { owner: 'dana' }), { status: 403, message: 'forbidden' });
  }
  assert.equal(existsSync(exportDir), false);
});

test('exportRecords rejects an unknown status and writes nothing', async () => {
  const exportDir = path.join(root, 'invalid');
  const { exporter } = createApp({ exportDir, now: fixedNow });

  await assert.rejects(exporter.exportRecords(admin, { status: 'deleted' }), { status: 400, message: 'unknown status: deleted' });
  assert.equal(existsSync(exportDir), false);
});

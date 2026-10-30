import assert from 'node:assert/strict';
import { createWriteStream, mkdtempSync, readFileSync, rmSync, type WriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Writable } from 'node:stream';
import { after, test } from 'node:test';

import { writeExport } from '../src/export.ts';
import type { RecordItem } from '../src/records/store.ts';

const root = mkdtempSync(path.join(tmpdir(), 'records-write-'));
after(() => rmSync(root, { recursive: true, force: true }));

const records: RecordItem[] = [
  { id: 7, title: 'Budget, draft', owner: 'li', status: 'active', createdAt: '2026-01-05T09:00:00Z' },
];
const now = new Date('2026-09-24T09:00:00Z');

// Stands in for an export volume that accepts the file but never completes a write.
function stalledStream(): Writable {
  return new Writable({ write(_chunk, _encoding, _callback) {} });
}

test('writeExport writes the CSV to a timestamped file', async () => {
  const result = await writeExport(path.join(root, 'plain'), records, now, { timeoutMs: 1000 });
  assert.equal(result.timedOut, false);
  assert.equal(result.fileName, 'records-20260924T090000Z.csv');
  assert.equal(result.csv, 'id,title,owner,status,createdAt\r\n7,"Budget, draft",li,active,2026-01-05T09:00:00Z\r\n');
  assert.equal(readFileSync(result.path, 'utf8'), result.csv);
});

test('writeExport reports a timeout when the volume stalls', async () => {
  const started = Date.now();
  const result = await writeExport(path.join(root, 'stalled'), records, now, { timeoutMs: 20, open: stalledStream });
  assert.equal(result.timedOut, true);
  assert.ok(Date.now() - started < 1000);
});

test('writeExport ends the stream after a successful export', async () => {
  let opened: WriteStream | undefined;
  const open = (file: string) => (opened = createWriteStream(file));
  await writeExport(path.join(root, 'ended'), records, now, { timeoutMs: 1000, open });
  assert.equal(opened?.writableFinished, true);
});

test('writeExport destroys the stream when a write fails', async () => {
  const failing = new Writable({
    write(_chunk, _encoding, callback) {
      callback(new Error('disk full'));
    },
  });
  await assert.rejects(
    writeExport(path.join(root, 'failing'), records, now, { timeoutMs: 1000, open: () => failing }),
    /disk full/,
  );
  assert.equal(failing.destroyed, true);
});

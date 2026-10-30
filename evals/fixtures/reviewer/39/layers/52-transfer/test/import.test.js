import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { after, test } from 'node:test';

import { importRecords } from '../src/import.js';
import { RecordStore } from '../src/store.js';

const root = mkdtempSync(path.join(tmpdir(), 'records-import-'));
after(() => rmSync(root, { recursive: true, force: true }));

const csv = 'id,title,owner\r\n2,Vendor checklist,li\r\n1,"Lease, Building B",dana\r\n';

test('imports every record from a CSV stream', async () => {
  const store = new RecordStore();
  // Split mid-field so chunk boundaries are exercised.
  const count = await importRecords(Readable.from([csv.slice(0, 20), csv.slice(20)]), store);
  assert.equal(count, 2);
  assert.deepEqual(store.list(), [
    { id: 1, title: 'Lease, Building B', owner: 'dana' },
    { id: 2, title: 'Vendor checklist', owner: 'li' },
  ]);
});

test('imports from a file path', async () => {
  const file = path.join(root, 'records.csv');
  writeFileSync(file, csv);
  const store = new RecordStore();
  assert.equal(await importRecords(file, store), 2);
  assert.equal(store.size, 2);
});

test('rejects a row whose id is not a positive integer', async () => {
  const store = new RecordStore();
  await assert.rejects(
    importRecords(Readable.from(['id,title,owner\r\nx,Bad row,li\r\n']), store),
    /invalid record id: x/,
  );
});

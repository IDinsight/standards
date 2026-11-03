import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Writable } from 'node:stream';
import { after, test } from 'node:test';

import { exportRecords } from '../src/export.js';
import { importRecords } from '../src/import.js';
import { RecordStore } from '../src/store.js';

const root = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(root, { recursive: true, force: true }));

const records = [
  { id: 3, title: 'Q2 "priority" review', owner: 'dana' },
  { id: 1, title: 'Lease, Building B', owner: 'dana' },
  { id: 2, title: 'Vendor checklist', owner: 'li' },
];

const expected = 'id,title,owner\r\n'
  + '1,"Lease, Building B",dana\r\n'
  + '2,Vendor checklist,li\r\n'
  + '3,"Q2 ""priority"" review",dana\r\n';

function collector() {
  const chunks = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  return { stream, text: () => chunks.join('') };
}

test('exports records as CSV with a header row in id order', async () => {
  const out = collector();
  assert.equal(await exportRecords(new RecordStore(records), out.stream), 3);
  assert.equal(out.text(), expected);
});

test('exports to a file path', async () => {
  const file = path.join(root, 'records.csv');
  await exportRecords(new RecordStore(records), file);
  assert.equal(readFileSync(file, 'utf8'), expected);
});

test('an exported file imports back unchanged', async () => {
  const file = path.join(root, 'round-trip.csv');
  await exportRecords(new RecordStore(records), file);
  const copy = new RecordStore();
  await importRecords(file, copy);
  assert.deepEqual(copy.list(), new RecordStore(records).list());
});

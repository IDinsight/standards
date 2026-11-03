import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DatabaseError } from '../src/db/client.js';
import { ExportConflictError } from '../src/exports/repository.js';
import { runExport } from '../src/exports/service.js';
import { fakeDb } from './support/fake-db.js';

const now = () => new Date('2026-09-20T06:00:00Z');
const pending = {
  rows: [
    { id: 3, customer: 'Acme', amount_cents: 9900, issued_on: '2026-09-01' },
    { id: 4, customer: 'Northwind Traders', amount_cents: 125000, issued_on: '2026-09-03' },
  ],
  changes: 0,
  lastInsertRowid: null,
};
const inserted = { rows: [], changes: 1, lastInsertRowid: 12 };
const updated = { rows: [], changes: 1, lastInsertRowid: null };
const unchanged = { rows: [], changes: 0, lastInsertRowid: null };

test('an export marks every pending invoice with the new run', async () => {
  const db = fakeDb([pending, inserted, updated, updated]);
  const result = await runExport(db, { now });

  assert.deepEqual(db.events, ['begin', 'commit']);
  assert.deepEqual(db.statements.slice(1).map((statement) => statement.args), [
    ['2026-09-20T06:00:00.000Z', 2],
    [12, 3],
    [12, 4],
  ]);
  assert.equal(result.runId, 12);
  assert.equal(result.invoiceCount, 2);
  assert.equal(
    result.csv,
    'invoice_id,customer,amount,issued_on\r\n3,Acme,99.00,2026-09-01\r\n4,Northwind Traders,1250.00,2026-09-03\r\n',
  );
});

test('no run is recorded when nothing is pending', async () => {
  const db = fakeDb([unchanged]);
  assert.equal(await runExport(db, { now }), null);
  assert.equal(db.statements.length, 1);
  assert.deepEqual(db.events, ['begin', 'commit']);
});

test('an invoice already taken by another run rolls the export back', async () => {
  const db = fakeDb([pending, inserted, updated, unchanged]);
  await assert.rejects(runExport(db, { now }), ExportConflictError);
  assert.deepEqual(db.events, ['begin', 'rollback']);
});

test('a database error while marking invoices rolls the export back', async () => {
  const db = fakeDb([pending, inserted, new DatabaseError('database is locked')]);
  await assert.rejects(runExport(db, { now }), DatabaseError);
  assert.deepEqual(db.events, ['begin', 'rollback']);
});

import assert from 'node:assert/strict';
import { before, test } from 'node:test';

import { migrate } from '../../scripts/migrate.js';
import { connect } from '../../src/db/client.js';
import { insertInvoice, listInvoices } from '../../src/invoices/repository.js';

// Runs against the libSQL server at LIBSQL_URL (default http://127.0.0.1:8080).
// Use a scratch database: the tests clear the invoices table.
const db = connect();

before(async () => {
  await migrate(db);
  await db.execute('DELETE FROM invoices');
});

test('stored invoices are listed in id order', async () => {
  const first = await insertInvoice(db, { customer: 'Acme', amountCents: 9900, issuedOn: '2026-09-01' });
  const second = await insertInvoice(db, { customer: 'Northwind Traders', amountCents: 125000, issuedOn: '2026-09-03' });
  const listed = await listInvoices(db);
  assert.deepEqual(listed.map((invoice) => invoice.id), [first, second]);
  assert.equal(listed[1].amountCents, 125000);
});

test('the database rejects an amount that is not positive', async () => {
  await assert.rejects(
    insertInvoice(db, { customer: 'Acme', amountCents: 0, issuedOn: '2026-09-01' }),
    /CHECK constraint failed/,
  );
});

import { readFileSync } from 'node:fs';

import { connect, literal } from '@records/db';

import { databaseUrl } from '../../src/config.js';

const schema = readFileSync(new URL('../../../../db/schema.sql', import.meta.url), 'utf8');

export const seedRows = [
  [1, 'Lease agreement, Building B', 'dana', 'active', '2026-03-02T10:15:00Z'],
  [2, 'Vendor onboarding checklist', 'li', 'active', '2026-03-09T14:40:00Z'],
  [3, 'Q2 "priority" accounts review', 'dana', 'archived', '2026-04-01T08:05:00Z'],
  [4, 'Insurance renewal 2026', 'marco', 'active', '2026-04-18T16:20:00Z'],
  [5, 'Data retention policy', 'li', 'archived', '2026-05-06T11:00:00Z'],
  [6, 'Office move inventory', 'marco', 'active', '2026-06-12T09:30:00Z'],
];

// Connects to the database at DATABASE_URL, drops and recreates the tables
// from db/schema.sql, loads the seed rows, runs fn with the client, and
// disconnects.
export async function withDatabase(fn) {
  const db = await connect(databaseUrl());
  try {
    await db.query(`DROP TABLE IF EXISTS export_jobs, records; ${schema}`);
    const values = seedRows.map((row) => `(${row.map((value) => literal(value)).join(', ')})`).join(', ');
    await db.query(`INSERT INTO records (id, title, owner, status, created_at) VALUES ${values}`);
    return await fn(db);
  } finally {
    await db.end();
  }
}

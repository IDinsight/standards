import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { connect } from '../src/db/client.js';

const MIGRATIONS = fileURLToPath(new URL('../migrations/', import.meta.url));

function statements(sql) {
  return sql.split(/;\s*$/m).map((statement) => statement.trim()).filter(Boolean);
}

// Applies the migrations not yet recorded in schema_migrations, in file-name
// order, each in its own transaction. Returns the names applied.
export async function migrate(db) {
  await db.execute('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
  const { rows } = await db.execute('SELECT name FROM schema_migrations');
  const done = new Set(rows.map((row) => row.name));
  const applied = [];
  for (const name of (await readdir(MIGRATIONS)).filter((file) => file.endsWith('.sql')).sort()) {
    if (done.has(name)) continue;
    const sql = await readFile(path.join(MIGRATIONS, name), 'utf8');
    await db.transaction(async (tx) => {
      for (const statement of statements(sql)) await tx.execute(statement);
      await tx.execute('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)', [name, new Date().toISOString()]);
    });
    applied.push(name);
  }
  return applied;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const applied = await migrate(connect());
  console.log(applied.length ? `Applied ${applied.join(', ')}` : 'Database is up to date');
}

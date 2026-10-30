#!/usr/bin/env node
// One-off migration for record import files produced by the old tracker,
// which used `closed` where the service uses `archived`.
//
//   node scripts/migrate-closed-status.mjs <import.json> [...]
//
// Rewrites each file in place and prints how many records changed.
import { readFileSync, writeFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node scripts/migrate-closed-status.mjs <import.json> [...]');
  process.exit(1);
}

for (const file of files) {
  const records = JSON.parse(readFileSync(file, 'utf8'));
  let changed = 0;
  for (const record of records) {
    if (record.status === 'closed') {
      record.status = 'archived';
      changed += 1;
    }
  }
  writeFileSync(file, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`${file}: ${changed} record(s) changed`);
}

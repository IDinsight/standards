#!/usr/bin/env node
// Import one bank CSV export into data/ledger.jsonl. Run from the repository root.
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { LedgerError, parseFile } from '../src/ledger.js';

const LEDGER = 'data/ledger.jsonl';
const DONE_DIR = 'inbox/done';
const LOCK = 'var/import.lock';
const LOG = 'var/import.log';

const log = (message) => appendFileSync(LOG, `${new Date().toISOString()} ${message}\n`);

const input = process.argv[2];
if (!input) {
  console.error('usage: node bin/import.js <export.csv>');
  process.exit(64);
}

mkdirSync('var', { recursive: true });
if (existsSync(LOCK)) {
  console.error(`another import holds ${LOCK}`);
  process.exit(75);
}
writeFileSync(LOCK, `${process.pid}\n`);
log(`start ${input}`);

try {
  const entries = parseFile(readFileSync(input, 'utf8'));
  appendFileSync(LEDGER, entries.map((entry) => `${JSON.stringify(entry)}\n`).join(''));
  mkdirSync(DONE_DIR, { recursive: true });
  renameSync(input, path.join(DONE_DIR, path.basename(input)));
  log(`imported ${entries.length} from ${input}`);
  console.log(`imported ${entries.length} entries from ${input}`);
} catch (error) {
  if (!(error instanceof LedgerError)) throw error;
  log(`rejected ${input}: ${error.message}`);
  console.error(`rejected ${input}: ${error.message}`);
  process.exitCode = 65;
} finally {
  unlinkSync(LOCK);
}

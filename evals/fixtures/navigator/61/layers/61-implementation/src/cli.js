#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseEntries } from './parse.js';

const file = process.argv[2];
if (!file) {
  console.error('usage: timesheet <file>');
  process.exit(2);
}

const { entries, errors } = parseEntries(readFileSync(file, 'utf8'));
for (const error of errors) {
  console.error(`line ${error.line}: ${error.message}`);
}
const total = entries.reduce((sum, entry) => sum + entry.minutes, 0);
console.log(`${entries.length} entries, ${Math.floor(total / 60)}h ${total % 60}m`);
process.exitCode = errors.length ? 1 : 0;

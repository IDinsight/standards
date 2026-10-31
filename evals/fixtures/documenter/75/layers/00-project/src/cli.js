#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { FIELDS, tally } from './count.js';

const USAGE = 'usage: tally [--json] [--lines] [--words] [--chars] <file>...';

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const files = args.filter((arg) => !arg.startsWith('--'));

for (const flag of flags) {
  if (!['--json', ...FIELDS.map((name) => `--${name}`)].includes(flag)) {
    console.error(`tally: unknown option ${flag}`);
    console.error(USAGE);
    process.exit(2);
  }
}
if (files.length === 0) {
  console.error(USAGE);
  process.exit(2);
}

const chosen = FIELDS.filter((name) => flags.has(`--${name}`));
const fields = chosen.length ? chosen : FIELDS;

let results;
try {
  results = files.map((file) => ({ file, ...tally(readFileSync(file, 'utf8')) }));
} catch (error) {
  console.error(`tally: ${error.message}`);
  process.exit(1);
}

if (flags.has('--json')) {
  const rows = results.map((row) => Object.fromEntries([['file', row.file], ...fields.map((name) => [name, row[name]])]));
  console.log(JSON.stringify(rows, null, 2));
} else {
  for (const row of results) {
    console.log([...fields.map((name) => String(row[name]).padStart(7)), row.file].join(' '));
  }
}

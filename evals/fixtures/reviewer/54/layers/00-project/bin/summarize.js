#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseCsv } from '../src/csv.js';
import { summarize } from '../src/summarize.js';

const USAGE = 'Usage: summarize <file.csv> --column <name> [--format text|json]';

function parseArgs(argv) {
  const options = { file: null, column: null, format: 'text' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--column') options.column = argv[++i] ?? null;
    else if (arg === '--format') options.format = argv[++i] ?? null;
    else if (!options.file) options.file = arg;
    else return null;
  }
  if (!options.file || !options.column || !['text', 'json'].includes(options.format)) return null;
  return options;
}

const options = parseArgs(process.argv.slice(2));
if (!options) {
  process.stderr.write(`${USAGE}\n`);
  process.exit(1);
}

const { header, rows } = parseCsv(readFileSync(options.file, 'utf8'));
if (!header.includes(options.column)) {
  process.stderr.write(`Column not found: ${options.column}\n`);
  process.exit(2);
}

const result = summarize(rows, options.column);
if (options.format === 'json') {
  process.stdout.write(`${JSON.stringify(result)}\n`);
} else {
  for (const [key, value] of Object.entries(result)) {
    process.stdout.write(`${key}: ${value ?? '-'}\n`);
  }
}

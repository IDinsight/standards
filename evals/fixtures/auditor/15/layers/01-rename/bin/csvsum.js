#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { parseCsv } from '../src/parse.js';
import { formatSummary, summarize } from '../src/summarize.js';

const USAGE = 'usage: csvsum <file> --column <name> [--delimiter <char>] [--format text|json]';

function fail(message, code) {
  process.stderr.write(`csvsum: ${message}\n`);
  process.exit(code);
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      column: { type: 'string', short: 'c' },
      delimiter: { type: 'string', default: ',' },
      format: { type: 'string', default: 'text' },
    },
  });
} catch (error) {
  fail(`${error.message}\n${USAGE}`, 2);
}

const { values, positionals } = parsed;
if (positionals.length !== 1 || !values.column || !['text', 'json'].includes(values.format)) {
  fail(USAGE, 2);
}

try {
  const { header, rows } = parseCsv(readFileSync(positionals[0], 'utf8'), values.delimiter);
  if (!header.includes(values.column)) fail(`no column named ${values.column}`, 1);
  process.stdout.write(`${formatSummary(summarize(rows, values.column), values.format)}\n`);
} catch (error) {
  fail(error.message, 1);
}

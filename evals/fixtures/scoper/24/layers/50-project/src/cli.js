#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { render, selectRecords } from './export.js';

const USAGE = 'Usage: ledger-export --input <file.json> [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--account <name>] [--format csv|json] [--out <file>]';

export function main(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      input: { type: 'string' },
      from: { type: 'string' },
      to: { type: 'string' },
      account: { type: 'string' },
      format: { type: 'string', default: 'csv' },
      out: { type: 'string' },
      help: { type: 'boolean', default: false },
    },
  });
  if (values.help) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }
  if (!values.input) {
    process.stderr.write(`ledger-export: --input is required\n${USAGE}\n`);
    return 2;
  }
  const records = JSON.parse(readFileSync(values.input, 'utf8'));
  const output = render(selectRecords(records, values), values.format);
  if (values.out) writeFileSync(values.out, output);
  else process.stdout.write(output);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`ledger-export: ${error.message}\n`);
    process.exitCode = 1;
  }
}

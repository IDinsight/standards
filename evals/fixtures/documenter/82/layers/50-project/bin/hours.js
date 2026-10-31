#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { formatTable, parseCsv, summarize } from '../src/summarize.js';

function main(args) {
  const json = args.includes('--json');
  const files = args.filter((arg) => arg !== '--json');
  if (files.length !== 1) {
    process.stderr.write('Usage: hours [--json] <timesheet.csv>\n');
    return 2;
  }
  let rows;
  try {
    rows = summarize(parseCsv(readFileSync(files[0], 'utf8')));
  } catch (error) {
    process.stderr.write(`hours: ${error.message}\n`);
    return 1;
  }
  process.stdout.write(`${json ? JSON.stringify(rows) : formatTable(rows)}\n`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));

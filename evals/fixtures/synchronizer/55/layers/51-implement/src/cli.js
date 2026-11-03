#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { readEntries } from './entries.js';
import { formatTotals, inMonth, totalsByCategory } from './summary.js';

const USAGE = 'Usage: ledger summary <file> [--month YYYY-MM]\n';
const MONTH = /^\d{4}-\d{2}$/;

export function run(argv, out = process.stdout, err = process.stderr) {
  const [command, file, ...options] = argv;
  if (command !== 'summary' || !file) {
    err.write(USAGE);
    return 2;
  }
  let month = null;
  for (let index = 0; index < options.length; index += 1) {
    if (options[index] !== '--month') {
      err.write(`Unknown option: ${options[index]}\n${USAGE}`);
      return 2;
    }
    month = options[index + 1] ?? '';
    index += 1;
  }
  if (month !== null && !MONTH.test(month)) {
    err.write(`Invalid --month value "${month}"; expected YYYY-MM\n`);
    return 2;
  }
  let entries = readEntries(file);
  if (month !== null) entries = inMonth(entries, month);
  out.write(`${formatTotals(totalsByCategory(entries))}\n`);
  return 0;
}

const invoked = process.argv[1]
  && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (invoked) process.exitCode = run(process.argv.slice(2));

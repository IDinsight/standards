#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { readEntries } from './entries.js';
import { formatTotals, totalsByCategory } from './summary.js';

export function run(argv, out = process.stdout, err = process.stderr) {
  const [command, file] = argv;
  if (command !== 'summary' || !file) {
    err.write('Usage: ledger summary <file>\n');
    return 2;
  }
  out.write(`${formatTotals(totalsByCategory(readEntries(file)))}\n`);
  return 0;
}

const invoked = process.argv[1]
  && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (invoked) process.exitCode = run(process.argv.slice(2));

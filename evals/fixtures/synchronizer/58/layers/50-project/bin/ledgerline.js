#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseStatement } from '../src/parse.js';
import { formatCents, monthSummary } from '../src/summary.js';

const USAGE = 'Usage: ledgerline import <file.csv> | ledgerline summary <file.csv> --month YYYY-MM';

function readEntries(file) {
  return parseStatement(readFileSync(file, 'utf8'));
}

function main(argv) {
  const [command, file, ...rest] = argv;
  if (command === 'import' && file) {
    const entries = readEntries(file);
    console.log(`Read ${entries.length} entries from ${file}`);
    return 0;
  }
  if (command === 'summary' && file) {
    const flag = rest.indexOf('--month');
    const month = flag === -1 ? undefined : rest[flag + 1];
    if (!month) {
      console.error('summary needs --month YYYY-MM');
      return 1;
    }
    let result;
    try {
      result = monthSummary(readEntries(file), month);
    } catch (error) {
      if (error instanceof RangeError) {
        console.error(error.message);
        return 2;
      }
      throw error;
    }
    console.log(`${result.month}: ${result.count} entries`);
    console.log(`  income   ${formatCents(result.income)}`);
    console.log(`  spending ${formatCents(result.spending)}`);
    console.log(`  net      ${formatCents(result.net)}`);
    return 0;
  }
  console.error(USAGE);
  return 1;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 3;
}

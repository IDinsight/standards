#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseInvoices } from '../src/parse.js';
import { summarize } from '../src/summary.js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: ledger <invoices.csv>');
  process.exit(1);
}

console.log(summarize(parseInvoices(readFileSync(file, 'utf8'))));

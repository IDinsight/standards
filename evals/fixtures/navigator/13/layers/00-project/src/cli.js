#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { formatCents } from './money.js';
import { invoiceTotals } from './totals.js';

const [file] = process.argv.slice(2);
if (!file) {
  console.error('usage: invoice-totals <invoice.json>');
  process.exit(2);
}

const invoice = JSON.parse(await readFile(file, 'utf8'));
const totals = invoiceTotals(invoice);
for (const [label, cents] of Object.entries(totals)) {
  console.log(`${label.padEnd(9)}${formatCents(cents, invoice.currency)}`);
}

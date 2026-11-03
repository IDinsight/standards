import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { loadSettings } from './config.js';
import { invoiceTotals } from './totals.js';

const DATA = fileURLToPath(new URL('../data/invoices.json', import.meta.url));

const settings = loadSettings();
const invoices = JSON.parse(readFileSync(process.argv[2] ?? DATA, 'utf8'));

console.log(`${settings.company} - invoice summary`);
let grand = 0;
for (const invoice of invoices) {
  const { total } = invoiceTotals(invoice, settings.taxRate);
  grand += total;
  console.log(`${invoice.number}  ${invoice.customer}  ${total.toFixed(2)}`);
}
console.log(`Total: ${grand.toFixed(2)}`);

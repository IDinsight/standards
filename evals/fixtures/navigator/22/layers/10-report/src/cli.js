import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { loadSettings } from './config.js';
import { summaryLines } from './report.js';
import { invoiceTotals } from './totals.js';

const DATA = fileURLToPath(new URL('../data/invoices.json', import.meta.url));

const settings = loadSettings();
const invoices = JSON.parse(readFileSync(process.argv[2] ?? DATA, 'utf8'));

console.log(`${settings.company} - invoice summary`);
for (const line of summaryLines(invoices, settings)) console.log(line);
const grand = invoices.reduce((sum, invoice) => sum + invoiceTotals(invoice, settings.taxRate).total, 0);
console.log(`Total: ${grand.toFixed(2)}`);

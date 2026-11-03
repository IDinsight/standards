import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { loadSettings } from './config.js';
import { formatMoney, resolveCurrency } from './format/money.js';
import { summaryLines } from './report.js';
import { invoiceTotalsMinor } from './totals.js';

const DATA = fileURLToPath(new URL('../data/invoices.json', import.meta.url));

const settings = loadSettings();
const currency = resolveCurrency(settings.currency);
const invoices = JSON.parse(readFileSync(process.argv[2] ?? DATA, 'utf8'));

console.log(`${settings.company} - invoice summary`);
for (const line of summaryLines(invoices, settings)) console.log(line);
const grand = invoices.reduce(
  (sum, invoice) => sum + invoiceTotalsMinor(invoice, settings.taxRate, currency.decimals).total,
  0,
);
console.log(`Total: ${formatMoney(grand, currency)}`);

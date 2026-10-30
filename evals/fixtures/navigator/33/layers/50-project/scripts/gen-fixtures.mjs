import { mkdirSync, writeFileSync } from 'node:fs';

import { seedInvoices } from './seed.mjs';

const outDir = new URL('../test/fixtures/generated/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const invoices = seedInvoices();
writeFileSync(new URL('invoices.json', outDir), JSON.stringify(invoices, null, 2) + '\n');
console.log('wrote ' + invoices.length + ' invoices to test/fixtures/generated/invoices.json');

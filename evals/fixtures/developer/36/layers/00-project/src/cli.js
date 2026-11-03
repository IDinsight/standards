#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseInventory, totalUnits } from './inventory.js';

const [file] = process.argv.slice(2);
if (!file) {
  console.error('usage: stockroom <inventory.csv>');
  process.exit(2);
}

const items = parseInventory(readFileSync(file, 'utf8'));
for (const item of items) console.log(`${item.sku},${item.name},${item.qty}`);
console.log(`total,${totalUnits(items)}`);

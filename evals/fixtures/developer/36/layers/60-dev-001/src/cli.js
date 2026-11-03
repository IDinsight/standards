#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseInventory, totalUnits } from './inventory.js';
import { OptionError, parseOptions } from './options.js';

let options;
try {
  options = parseOptions(process.argv.slice(2));
} catch (error) {
  if (!(error instanceof OptionError)) throw error;
  console.error(error.message);
  process.exit(2);
}

const items = parseInventory(readFileSync(options.file, 'utf8'));
for (const item of items) console.log(`${item.sku},${item.name},${item.qty}`);
console.log(`total,${totalUnits(items)}`);

#!/usr/bin/env node
import { formatTable } from './format.js';
import { loadInventory } from './inventory.js';

const [command, file] = process.argv.slice(2);

if (command === 'list' && file) {
  const items = loadInventory(file);
  console.log(formatTable(items, ['sku', 'name', 'qty', 'reorderAt']));
} else {
  console.error('usage: stock list <inventory.csv>');
  process.exitCode = 1;
}

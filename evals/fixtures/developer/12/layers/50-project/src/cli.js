#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { formatTable } from './format.js';
import { addItem, adjust, createInventory, listItems, setReorderLevel } from './inventory.js';
import { load, save } from './store.js';

const USAGE = 'usage: pantry <add|adjust|reorder-level|list> ...';

export function run(args, { path = process.env.PANTRY_FILE ?? 'pantry.json', out = console.log } = {}) {
  const [command, ...rest] = args;
  const inventory = createInventory(load(path));
  switch (command) {
    case 'add': {
      const [sku, name, quantity = '0'] = rest;
      addItem(inventory, { sku, name, quantity: Number(quantity) });
      break;
    }
    case 'adjust': {
      const [sku, delta] = rest;
      adjust(inventory, sku, Number(delta));
      break;
    }
    case 'reorder-level': {
      const [sku, level] = rest;
      setReorderLevel(inventory, sku, level === 'none' ? null : Number(level));
      break;
    }
    case 'list':
      out(formatTable(listItems(inventory)));
      return 0;
    default:
      out(USAGE);
      return 1;
  }
  save(path, inventory.items);
  return 0;
}

const invoked = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  try {
    process.exitCode = run(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

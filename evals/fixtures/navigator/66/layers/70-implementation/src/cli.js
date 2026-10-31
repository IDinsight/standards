#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

import { toCsv } from './export.js';
import { loadItems, lowStock } from './inventory.js';

const USAGE = 'usage: stockroom <list|low|export> <file> [--below <n>]';

function belowOption(args) {
  const index = args.indexOf('--below');
  if (index === -1) return null;
  const value = Number(args[index + 1]);
  if (!Number.isFinite(value)) throw new Error('--below needs a number');
  return value;
}

export function run(argv, out = process.stdout) {
  const [command, file, ...rest] = argv;
  if (!command || !file) throw new Error(USAGE);
  const items = loadItems(file);
  if (command === 'list') {
    for (const item of items) out.write(`${item.sku}\t${item.name}\t${item.quantity}\n`);
    return;
  }
  if (command === 'low') {
    const threshold = belowOption(rest) ?? 5;
    for (const item of lowStock(items, threshold)) out.write(`${item.sku}\t${item.quantity}\n`);
    return;
  }
  if (command === 'export') {
    const threshold = belowOption(rest);
    out.write(toCsv(threshold === null ? items : lowStock(items, threshold)));
    return;
  }
  throw new Error(`unknown command: ${command}\n${USAGE}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

import { readFileSync } from 'node:fs';

import { reportRows, summarize } from '@stockroom/core';

export function formatReport(items) {
  const rows = reportRows(items);
  const lines = rows.map((row) => `${row.sku.padEnd(8)}${row.name.padEnd(20)}${String(row.quantity).padStart(6)}`);
  const { skus, units } = summarize(items);
  return [...lines, `${skus} skus, ${units} units`].join('\n');
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

export function run(argv, { readItems = readJson } = {}) {
  const [command, file = 'inventory.json'] = argv;
  if (command !== 'report') return { code: 2, output: 'usage: stockroom report [inventory.json]' };
  return { code: 0, output: formatReport(readItems(file)) };
}

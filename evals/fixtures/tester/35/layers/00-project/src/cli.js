#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseOrders } from './parse.js';
import { summarize } from './summary.js';

const file = process.argv[2];
if (!file) {
  console.error('usage: order-summary <orders.csv>');
  process.exit(2);
}
for (const row of summarize(parseOrders(readFileSync(file, 'utf8')))) {
  console.log(`${row.customer}\t${row.total.toFixed(2)}`);
}

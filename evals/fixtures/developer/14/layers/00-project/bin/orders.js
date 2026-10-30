#!/usr/bin/env node
import { formatCents } from '../src/format.js';
import { loadOrders, summarize } from '../src/orders.js';

const [command, file] = process.argv.slice(2);

if (command === 'summary' && file) {
  const { count, totalCents } = summarize(loadOrders(file));
  console.log('Orders: ' + count);
  console.log('Total: ' + formatCents(totalCents));
} else {
  console.error('Usage: orders summary <file>');
  process.exitCode = 2;
}

import { exportOrders } from './export.js';
import { loadOrders } from './orders.js';

const [file] = process.argv.slice(2);
if (!file) {
  console.error('usage: node src/cli.js <orders.json>');
  process.exit(2);
}

process.stdout.write(exportOrders(await loadOrders(file)));

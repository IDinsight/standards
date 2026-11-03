import { readFileSync } from 'node:fs';

import { formatReport } from './report.js';

const [inventoryPath, thresholdsPath] = process.argv.slice(2);
if (!inventoryPath) {
  console.error('usage: node src/cli.js <inventory.json> [thresholds.json]');
  process.exit(2);
}

const items = JSON.parse(readFileSync(inventoryPath, 'utf8'));
const thresholds = thresholdsPath ? JSON.parse(readFileSync(thresholdsPath, 'utf8')) : {};
console.log(formatReport(items, thresholds));

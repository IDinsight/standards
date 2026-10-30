import { readFileSync } from 'node:fs';

import { parseInventory } from './inventory.js';
import { stockReport } from './report.js';

const [file = 'data/stock.csv'] = process.argv.slice(2);
console.log(stockReport(parseInventory(readFileSync(file, 'utf8'))));

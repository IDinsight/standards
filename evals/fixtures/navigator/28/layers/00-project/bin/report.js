#!/usr/bin/env node
import { readdirSync } from 'node:fs';

import { summarize } from '../src/report.js';

const dir = process.argv[2] ?? 'data';
const ids = readdirSync(dir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => name.slice(0, -'.json'.length))
  .sort();

console.log(JSON.stringify(summarize(dir, ids), null, 2));

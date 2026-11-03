#!/usr/bin/env node
import { parseArgs } from 'node:util';

import { toCsv } from '../src/csv.js';
import { filterSince } from '../src/filter.js';
import { loadVisits } from '../src/load.js';

const { values, positionals } = parseArgs({
  options: { since: { type: 'string' } },
  allowPositionals: true,
});

const file = positionals[0] ?? 'data/visits.json';
let visits = await loadVisits(file);
if (values.since !== undefined) visits = filterSince(visits, values.since);
process.stdout.write(toCsv(visits) + '\n');

#!/usr/bin/env node
import { toCsv } from '../src/csv.js';
import { loadVisits } from '../src/load.js';

const file = process.argv[2] ?? 'data/visits.json';
const visits = await loadVisits(file);
process.stdout.write(toCsv(visits) + '\n');

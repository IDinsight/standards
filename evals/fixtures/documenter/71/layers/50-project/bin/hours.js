#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { run } from '../src/cli.js';

const file = process.env.HOURS_FILE ?? 'hours.json';
const entries = JSON.parse(readFileSync(file, 'utf8'));
process.exitCode = run(process.argv.slice(2), entries, (text) => process.stdout.write(text));

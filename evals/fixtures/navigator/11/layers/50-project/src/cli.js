#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { formatTask, parseTasks, summarize } from './tasks.js';

const args = process.argv.slice(2);
const showAll = args.includes('--all');
const file = args.find((arg) => !arg.startsWith('--'));
if (!file) {
  console.error('usage: tasklist <file.json> [--all]');
  process.exit(2);
}

const tasks = parseTasks(await readFile(file, 'utf8'));
const shown = showAll ? tasks : tasks.filter((task) => !task.done);
for (const task of shown) console.log(formatTask(task));
console.log(summarize(tasks));

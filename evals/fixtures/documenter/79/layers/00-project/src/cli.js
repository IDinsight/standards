import { readFileSync } from 'node:fs';

import { exportItems } from './export.js';
import { importItems } from './import.js';
import { loadItems, saveItems } from './store.js';

const USAGE = 'usage: stockroom <export|import> [options]';

function option(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

export function run(args, io) {
  const [command, ...rest] = args;
  const db = option(rest, '--db') ?? 'stockroom.json';

  if (command === 'export') {
    io.stdout.write(exportItems(loadItems(db)));
    return 0;
  }

  if (command === 'import') {
    const file = rest.find((arg, index) => !arg.startsWith('--') && rest[index - 1] !== '--db');
    if (!file) {
      io.stderr.write('usage: stockroom import <file.csv> [--replace] [--db <path>]\n');
      return 2;
    }
    let result;
    try {
      result = importItems(loadItems(db), readFileSync(file, 'utf8'), { replace: rest.includes('--replace') });
    } catch (error) {
      io.stderr.write(`import failed: ${error.message}\n`);
      return 1;
    }
    saveItems(db, result.items);
    io.stdout.write(`added ${result.added}, updated ${result.updated}, skipped ${result.skipped}\n`);
    return 0;
  }

  io.stderr.write(`${USAGE}\n`);
  return 2;
}

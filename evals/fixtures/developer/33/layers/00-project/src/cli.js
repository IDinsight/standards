#!/usr/bin/env node
import { formatTable, loadInventory } from './inventory.js';

const USAGE = 'usage: stock list <inventory.json>\n';

export async function run(argv, out = process.stdout) {
  const [command, file] = argv;
  if (command === 'list' && file) {
    const items = await loadInventory(file);
    out.write(`${formatTable(items)}\n`);
    return 0;
  }
  out.write(USAGE);
  return 2;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run(process.argv.slice(2)).then(
    (code) => { process.exitCode = code; },
    (error) => { console.error(error.message); process.exitCode = 1; },
  );
}

import { readFile, writeFile } from 'node:fs/promises';

import { parseCsv } from './parse.js';

export const USAGE = 'usage: ledger import <file.csv> [--out <file.json>] [--dry-run]\n';

export async function runImport(argv, { stdout, stderr }) {
  const options = { dryRun: false, out: null, file: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--out') options.out = argv[++i];
    else if (!options.file) options.file = arg;
    else {
      stderr.write('unexpected argument: ' + arg + '\n');
      return 2;
    }
  }
  if (!options.file) {
    stderr.write(USAGE);
    return 2;
  }
  let transactions;
  try {
    transactions = parseCsv(await readFile(options.file, 'utf8'));
  } catch (error) {
    stderr.write('import failed: ' + error.message + '\n');
    return 1;
  }
  const total = transactions.reduce((sum, transaction) => sum + transaction.amountCents, 0);
  stdout.write(transactions.length + ' transactions, net ' + (total / 100).toFixed(2) + '\n');
  if (options.dryRun) return 0;
  const json = JSON.stringify(transactions, null, 2) + '\n';
  if (options.out) await writeFile(options.out, json);
  else stdout.write(json);
  return 0;
}

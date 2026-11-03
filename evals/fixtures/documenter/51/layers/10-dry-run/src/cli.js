import { parseArgs } from 'node:util';

import { prune } from './prune.js';

export async function run(argv, { out = process.stdout, now = Date.now() } = {}) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      days: { type: 'string', default: '14' },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  const dir = positionals[0];
  if (!dir) {
    out.write('usage: logprune <dir> [--days N] [--dry-run]\n');
    return 2;
  }
  const maxAgeDays = Number(values.days);
  if (!Number.isInteger(maxAgeDays) || maxAgeDays < 1) {
    out.write(`invalid --days value: ${values.days}\n`);
    return 2;
  }
  const dryRun = values['dry-run'];
  const expired = await prune(dir, { now, maxAgeDays, dryRun });
  for (const name of expired) out.write(`${dryRun ? 'would remove' : 'removed'} ${name}\n`);
  return 0;
}

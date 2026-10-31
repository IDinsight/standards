import { summarize } from './summary.js';

const USAGE = 'usage: hours summary\n';

export function run(argv, entries, write) {
  const [command, ...rest] = argv;
  if (command !== 'summary' || rest.length > 0) {
    write(USAGE);
    return 1;
  }
  for (const row of summarize(entries)) write(`${row.project}\t${row.hours}\n`);
  return 0;
}

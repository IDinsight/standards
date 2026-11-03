import { summarize } from './summary.js';

const USAGE = 'usage: hours summary [--since YYYY-MM-DD]\n';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function run(argv, entries, write) {
  const [command, ...rest] = argv;
  if (command !== 'summary') {
    write(USAGE);
    return 1;
  }
  let since;
  for (let index = 0; index < rest.length; index += 1) {
    if (rest[index] !== '--since') {
      write(USAGE);
      return 1;
    }
    const value = rest[index + 1] ?? '';
    if (!DATE.test(value) || Number.isNaN(Date.parse(value))) {
      write(`invalid --since date: ${value}\n`);
      return 2;
    }
    since = value;
    index += 1;
  }
  for (const row of summarize(entries, { since })) write(`${row.project}\t${row.hours}\n`);
  return 0;
}

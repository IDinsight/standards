import { loadItems } from './inventory.js';
import { toCsv } from './export.js';

const USAGE = 'Usage: inventory export <file>';

export async function run(argv, { stdout = process.stdout, stderr = process.stderr } = {}) {
  const [command, file, ...extra] = argv;
  if (command !== 'export' || !file || extra.length) {
    stderr.write(`${USAGE}\n`);
    return 2;
  }
  const items = await loadItems(file);
  stdout.write(toCsv(items));
  return 0;
}

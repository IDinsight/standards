import { readFile } from 'node:fs/promises';

import { UsageError, parseArgs } from './args.js';
import { render } from './format.js';
import { tally } from './tally.js';

export const USAGE = 'usage: logtally <file> [--format text|json]';

export async function run(argv, { stdout = process.stdout, stderr = process.stderr } = {}) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    stderr.write('logtally: ' + error.message + '\n' + USAGE + '\n');
    return 2;
  }
  let text;
  try {
    text = await readFile(options.file, 'utf8');
  } catch (error) {
    stderr.write('logtally: cannot read ' + options.file + ': ' + (error.code ?? error.message) + '\n');
    return 1;
  }
  stdout.write(render(tally(text), options.format));
  return 0;
}

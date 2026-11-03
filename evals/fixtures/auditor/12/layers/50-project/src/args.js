import { FORMATS } from './format.js';

export class UsageError extends Error {}

export function parseArgs(argv) {
  const options = { file: null, format: 'text' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--format' || arg === '-f') {
      i += 1;
      options.format = argv[i];
      if (!FORMATS.includes(options.format)) {
        throw new UsageError('--format must be one of: ' + FORMATS.join(', '));
      }
    } else if (arg.startsWith('-')) {
      throw new UsageError('unknown option ' + arg);
    } else if (options.file === null) {
      options.file = arg;
    } else {
      throw new UsageError('unexpected argument ' + arg);
    }
  }
  if (options.file === null) throw new UsageError('missing log file');
  return options;
}

export class OptionError extends Error {}

export const DEFAULT_THRESHOLD = 5;

const USAGE = 'usage: stockroom <inventory.csv> [--threshold <n>]';

export function parseOptions(args) {
  const options = { file: null, threshold: DEFAULT_THRESHOLD };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--threshold') {
      const value = args[(i += 1)];
      if (value === undefined || !/^\d+$/.test(value)) {
        throw new OptionError(`--threshold expects a non-negative integer, got ${value ?? 'nothing'}`);
      }
      options.threshold = Number(value);
    } else if (arg.startsWith('--')) {
      throw new OptionError(`unknown option ${arg}`);
    } else if (options.file === null) {
      options.file = arg;
    } else {
      throw new OptionError(`unexpected argument ${arg}`);
    }
  }
  if (options.file === null) throw new OptionError(USAGE);
  return options;
}

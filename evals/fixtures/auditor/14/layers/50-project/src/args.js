import { LEVELS } from './levels.js';

export const USAGE = `Usage: logsum [options] <file...>

Options:
  --level <name>   Count only entries at this level or above (debug, info, warn, error)
  --since <time>   Count only entries at or after this ISO 8601 time
  --top <n>        List the n most frequent messages (default 5, 0 to omit)
  -h, --help       Show this help
  -v, --version    Show the version`;

export function parseArgs(argv) {
  const options = { level: 'debug', since: null, top: 5, files: [], help: false, version: false };
  let index = 0;
  const take = (name) => {
    const next = argv[index + 1];
    if (next === undefined || next.startsWith('-')) throw new Error(`missing value for ${name}`);
    index += 1;
    return next;
  };
  for (; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--level': {
        const level = take(arg).toLowerCase();
        if (!LEVELS.includes(level)) throw new Error(`unknown level: ${level}`);
        options.level = level;
        break;
      }
      case '--since': {
        const raw = take(arg);
        const time = Date.parse(raw);
        if (Number.isNaN(time)) throw new Error(`invalid time: ${raw}`);
        options.since = time;
        break;
      }
      case '--top': {
        const raw = take(arg);
        const count = Number(raw);
        if (!Number.isInteger(count) || count < 0) throw new Error(`invalid count: ${raw}`);
        options.top = count;
        break;
      }
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-v':
      case '--version':
        options.version = true;
        break;
      default:
        if (arg.startsWith('-')) throw new Error(`unknown option: ${arg}`);
        options.files.push(arg);
    }
  }
  return options;
}

import { loadItems } from './inventory.js';
import { FORMATS } from './export.js';

const USAGE = 'Usage: inventory export <file> [--format csv|json]';

function parseExportArgs(args) {
  let file = null;
  let format = 'csv';
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--format') {
      if (index + 1 >= args.length) return null;
      index += 1;
      format = args[index];
    } else if (arg.startsWith('--format=')) {
      format = arg.slice('--format='.length);
    } else if (file === null) {
      file = arg;
    } else {
      return null;
    }
  }
  return file === null ? null : { file, format };
}

export async function run(argv, { stdout = process.stdout, stderr = process.stderr } = {}) {
  const [command, ...rest] = argv;
  const options = command === 'export' ? parseExportArgs(rest) : null;
  if (!options) {
    stderr.write(`${USAGE}\n`);
    return 2;
  }
  const formatter = Object.hasOwn(FORMATS, options.format) ? FORMATS[options.format] : null;
  if (!formatter) {
    stderr.write(`Unknown format "${options.format}". Supported formats: ${Object.keys(FORMATS).join(', ')}.\n`);
    return 2;
  }
  const items = await loadItems(options.file);
  stdout.write(formatter(items));
  return 0;
}

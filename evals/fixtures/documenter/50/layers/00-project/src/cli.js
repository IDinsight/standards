import { readFileSync } from 'node:fs';

import { count } from './count.js';

const FLAGS = { '--lines': 'lines', '--words': 'words', '--chars': 'chars' };
const ALL_FIELDS = ['lines', 'words', 'chars'];

export function parseArgs(argv) {
  const fields = [];
  const files = [];
  for (const arg of argv) {
    if (Object.hasOwn(FLAGS, arg)) {
      if (!fields.includes(FLAGS[arg])) fields.push(FLAGS[arg]);
    } else if (arg.startsWith('--')) {
      throw new Error(`unknown option: ${arg}`);
    } else {
      files.push(arg);
    }
  }
  return { fields: fields.length ? ALL_FIELDS.filter((field) => fields.includes(field)) : ALL_FIELDS, files };
}

export function formatRow(counts, fields, name) {
  const cells = fields.map((field) => String(counts[field]).padStart(7));
  return name === null ? cells.join(' ') : `${cells.join(' ')} ${name}`;
}

const defaultIo = {
  out: (text) => process.stdout.write(text),
  err: (text) => process.stderr.write(text),
  read: (source) => readFileSync(source, 'utf8'),
};

export function run(argv, io = defaultIo) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    io.err(`tally: ${error.message}\n`);
    return 2;
  }
  const inputs = options.files.length
    ? options.files.map((file) => [file, io.read(file)])
    : [[null, io.read(0)]];
  for (const [name, text] of inputs) io.out(`${formatRow(count(text), options.fields, name)}\n`);
  return 0;
}

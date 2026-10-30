import { readFileSync } from 'node:fs';

import { parse } from './parser.js';

export { parse, ParseError } from './parser.js';

// Read and parse a configuration file. The file is read as UTF-8.
export function load(path) {
  return parse(readFileSync(path, 'utf8'));
}

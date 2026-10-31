#!/usr/bin/env node
import { loadNotes } from '../src/store.js';
import { toMarkdown } from '../src/export.js';

const [file] = process.argv.slice(2);
if (!file) {
  process.stderr.write('Usage: node bin/export.js <notes.json>\n');
  process.exit(1);
}
process.stdout.write(toMarkdown(await loadNotes(file)));

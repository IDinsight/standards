#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { QuerySyntaxError, parseQuery } from '../src/query.js';
import { loadSaved, runSaved, saveSearch } from '../src/saved.js';
import { search } from '../src/search.js';

const USAGE = `usage: notes search <query...>
       notes saved add <name> <query...>
       notes saved run <name>
       notes saved list`;

const dir = process.env.NOTES_DIR ?? '.notes';
const notesFile = path.join(dir, 'notes.json');
const savedFile = path.join(dir, 'saved.json');

function loadNotes() {
  return existsSync(notesFile) ? JSON.parse(readFileSync(notesFile, 'utf8')) : [];
}

function print(results) {
  for (const note of results) console.log(`${note.id}\t${note.title}`);
}

function main([command, ...args]) {
  if (command === 'search' && args.length) {
    print(search(loadNotes(), args.join(' ')));
    return 0;
  }
  if (command === 'saved') {
    const [action, name, ...query] = args;
    if (action === 'add' && name && query.length) {
      parseQuery(query.join(' '));
      saveSearch(savedFile, name, query.join(' '));
      return 0;
    }
    if (action === 'run' && name) {
      print(runSaved(loadSaved(savedFile), name, loadNotes()));
      return 0;
    }
    if (action === 'list') {
      for (const [saved, text] of Object.entries(loadSaved(savedFile))) console.log(`${saved}\t${text}`);
      return 0;
    }
  }
  console.error(USAGE);
  return 1;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  console.error(`notes: ${error.message}`);
  process.exitCode = error instanceof QuerySyntaxError ? 2 : 1;
}

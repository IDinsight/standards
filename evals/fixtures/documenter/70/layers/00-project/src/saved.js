import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { search } from './search.js';

// Saved searches are a JSON object mapping each name to the query text.
export function loadSaved(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
}

export function saveSearch(file, name, query) {
  const saved = loadSaved(file);
  saved[name] = query;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(saved, null, 2)}\n`);
}

export function runSaved(saved, name, notes) {
  if (!Object.hasOwn(saved, name)) throw new Error(`No saved search named "${name}"`);
  return search(notes, saved[name]);
}

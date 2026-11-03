import { readFileSync } from 'node:fs';
import path from 'node:path';

export class RecordNotFound extends Error {
  constructor(id) {
    super(`record ${id} not found`);
    this.name = 'RecordNotFound';
    this.id = id;
  }
}

// Read one stock record, stored as <dir>/<id>.json.
export function readRecord(dir, id) {
  const file = path.join(dir, `${id}.json`);
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') throw new RecordNotFound(id);
    throw error;
  }
  return JSON.parse(text);
}

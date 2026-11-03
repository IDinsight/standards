import { readFile, rename, writeFile } from 'node:fs/promises';

export class Directory {
  #contacts = new Map();

  add(contact) {
    if (!contact.id) throw new Error('contact id is required');
    this.#contacts.set(contact.id, { ...contact });
    return this;
  }

  get(id) {
    return this.#contacts.get(id) ?? null;
  }

  remove(id) {
    return this.#contacts.delete(id);
  }

  list() {
    return [...this.#contacts.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  get size() {
    return this.#contacts.size;
  }
}

export async function loadDirectory(path) {
  const fail = (message) => {
    throw new Error(path + ': ' + message);
  };
  const rows = JSON.parse(await readFile(path, 'utf8'));
  if (!Array.isArray(rows)) fail('expected a JSON array of contacts');
  const directory = new Directory();
  rows.forEach((row, index) => {
    const line = 'row ' + (index + 1);
    if (!row || typeof row !== 'object') fail(line + ' is not an object');
    if (!row.id) fail(line + ' has no id');
    if (!row.name) fail(line + ' has no name');
    if (directory.get(row.id)) fail(line + ' repeats id ' + row.id);
    const email = typeof row.email === 'string' ? row.email.trim().toLowerCase() : row.email;
    directory.add({ ...row, email });
  });
  return directory;
}

export async function saveDirectory(directory, path) {
  const temp = path + '.tmp';
  await writeFile(temp, JSON.stringify(directory.list(), null, 2) + '\n');
  await rename(temp, path);
}

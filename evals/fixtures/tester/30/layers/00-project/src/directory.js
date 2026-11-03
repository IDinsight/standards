import { readFile } from 'node:fs/promises';

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
  const rows = JSON.parse(await readFile(path, 'utf8'));
  const directory = new Directory();
  for (const row of rows) directory.add(row);
  return directory;
}

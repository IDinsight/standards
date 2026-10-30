import { readFileSync } from 'node:fs';

const DEFAULT_PATH = new URL('../data/books.json', import.meta.url);

export function createCatalog(books) {
  const byId = new Map(books.map((book) => [book.id, book]));
  return {
    list() {
      return books.slice();
    },
    get(id) {
      return byId.get(id) ?? null;
    },
  };
}

export function loadCatalog(path = DEFAULT_PATH) {
  return createCatalog(JSON.parse(readFileSync(path, 'utf8')));
}

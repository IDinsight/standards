import { readFileSync, writeFileSync } from 'node:fs';

// Bookmarks are kept in a single JSON file: { "nextId": 4, "items": [...] }.
export function createStore(file) {
  function load() {
    return JSON.parse(readFileSync(file, 'utf8'));
  }

  function save(data) {
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  }

  return {
    list() {
      return load().items;
    },

    add({ url, title, tags = [] }) {
      const data = load();
      const bookmark = { id: data.nextId, url, title, tags };
      data.items.push(bookmark);
      data.nextId += 1;
      save(data);
      return bookmark;
    },
  };
}

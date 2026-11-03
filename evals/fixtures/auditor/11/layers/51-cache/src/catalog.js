import { Cache } from './cache.js';

export function createCatalog(items = [], options = {}) {
  const byId = new Map(items.map((item) => [item.id, { ...item }]));
  const cache = new Cache(options);

  return {
    get(id) {
      const key = `item:${id}`;
      let item = cache.get(key);
      if (item === undefined) {
        item = byId.has(id) ? { ...byId.get(id) } : null;
        cache.set(key, item);
      }
      return item;
    },

    list(category) {
      const key = `list:${category ?? '*'}`;
      let result = cache.get(key);
      if (result === undefined) {
        result = [...byId.values()]
          .filter((item) => !category || item.category === category)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((item) => ({ ...item }));
        cache.set(key, result);
      }
      return result;
    },

    update(id, changes) {
      const item = byId.get(id);
      if (!item) throw new Error(`unknown item ${id}`);
      Object.assign(item, changes);
      cache.delete(`item:${id}`);
      cache.deletePrefix('list:');
      return { ...item };
    },
  };
}

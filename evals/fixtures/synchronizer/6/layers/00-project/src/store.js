// In-memory record store. Records get increasing numeric ids.

export function createStore() {
  const items = new Map();
  let nextId = 1;
  return {
    add(fields) {
      const record = { id: nextId, ...fields };
      nextId += 1;
      items.set(record.id, record);
      return record;
    },
    get(id) {
      return items.get(id) ?? null;
    },
    list() {
      return [...items.values()];
    },
  };
}

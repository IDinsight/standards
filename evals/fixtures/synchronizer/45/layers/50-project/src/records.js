export function createStore(rows = []) {
  const items = [];
  const add = (row) => {
    const record = { id: items.length + 1, ...row };
    items.push(record);
    return record;
  };
  rows.forEach(add);
  return {
    add,
    get(id) {
      return items.find((record) => record.id === id) ?? null;
    },
    list({ status } = {}) {
      return items.filter((record) => !status || record.status === status);
    },
  };
}

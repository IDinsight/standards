export function createStore(rows = []) {
  const items = rows.map((row) => ({ ...row }));
  return {
    list() {
      return items.map((row) => ({ ...row }));
    },
    add(row) {
      if (items.some((item) => item.id === row.id)) {
        throw new Error(`record ${row.id} already exists`);
      }
      items.push({ ...row });
    },
  };
}

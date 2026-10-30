export function createStore(records = []) {
  const items = records.map((record) => ({ ...record }));
  return {
    all: () => items.slice(),
    add(record) {
      items.push({ ...record });
    },
  };
}

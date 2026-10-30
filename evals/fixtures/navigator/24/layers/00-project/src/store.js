const orders = new Map();
let nextId = 1;

export function insert(order) {
  const id = String(nextId++);
  const saved = { id, ...order };
  orders.set(id, saved);
  return saved;
}

export function find(id) {
  return orders.get(id) ?? null;
}

export function all() {
  return [...orders.values()];
}

export function reset() {
  orders.clear();
  nextId = 1;
}

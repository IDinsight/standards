const orders = new Map();

export function seed(list) {
  orders.clear();
  for (const order of list) orders.set(order.id, order);
}

export function getOrder(id) {
  return orders.get(id) ?? null;
}

export function listOrders() {
  return [...orders.values()].sort((a, b) => b.id - a.id);
}

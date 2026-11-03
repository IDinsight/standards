export function listOrders(store) {
  return store.all().sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

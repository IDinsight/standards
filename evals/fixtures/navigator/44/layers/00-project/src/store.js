const SEED = [
  { id: 1001, customer: 'Harbor Supply', total: 182.4, placedAt: '2026-09-02T10:15:00Z' },
  { id: 1002, customer: 'Lindqvist, Bros.', total: 57, placedAt: '2026-09-03T08:40:00Z' },
  { id: 1003, customer: 'North "Pier" Café', total: 1204.99, placedAt: '2026-09-05T16:05:00Z' },
];

export function createStore(orders = SEED) {
  const items = orders.map((order) => ({ ...order }));
  return {
    all: () => items.map((order) => ({ ...order })),
    add(order) {
      items.push({ ...order });
    },
  };
}

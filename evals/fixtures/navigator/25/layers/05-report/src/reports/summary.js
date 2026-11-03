export function summarize(orders) {
  const total = orders.reduce((sum, order) => sum + order.amount, 0);
  return { count: orders.length, total: String(total) };
}

export function summarize(orders) {
  const total = orders.reduce((sum, order) => sum + order.amount, 0);
  const average = orders.length ? total / orders.length : 0;
  return { count: orders.length, total: total.toFixed(2), average: average.toFixed(2) };
}

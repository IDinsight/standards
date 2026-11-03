// Total order amounts per customer, in the order customers first appear.
export function summarize(orders) {
  const totals = new Map();
  for (const order of orders) {
    totals.set(order.customer, (totals.get(order.customer) ?? 0) + order.amount);
  }
  return [...totals].map(([customer, total]) => ({ customer, total: roundCents(total) }));
}

export function roundCents(value) {
  return Math.round(value * 100) / 100;
}

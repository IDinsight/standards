// Total order amounts per customer and currency, in the order each pair first
// appears. Refunds count against the total; currencies are never combined.
export function summarize(orders) {
  const totals = new Map();
  for (const order of orders) {
    const key = JSON.stringify([order.customer, order.currency]);
    const entry = totals.get(key) ?? { customer: order.customer, currency: order.currency, total: 0 };
    entry.total += order.type === 'refund' ? -order.amount : order.amount;
    totals.set(key, entry);
  }
  return [...totals.values()].map((entry) => ({ ...entry, total: roundCents(entry.total) }));
}

export function roundCents(value) {
  return Math.round(value * 100) / 100;
}

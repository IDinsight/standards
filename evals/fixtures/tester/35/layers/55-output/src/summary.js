// Total order amounts per customer and currency, sorted by customer and then
// currency. Refunds count against the total; currencies are never combined.
export function summarize(orders) {
  const totals = new Map();
  for (const order of orders) {
    const key = JSON.stringify([order.customer, order.currency]);
    const entry = totals.get(key) ?? { customer: order.customer, currency: order.currency, total: 0 };
    entry.total += order.type === 'refund' ? -order.amount : order.amount;
    totals.set(key, entry);
  }
  return [...totals.values()]
    .map((entry) => ({ ...entry, total: roundCents(entry.total) }))
    .sort(byCustomerThenCurrency);
}

export function roundCents(value) {
  return Math.round(value * 100) / 100;
}

function byCustomerThenCurrency(a, b) {
  if (a.customer !== b.customer) return a.customer < b.customer ? -1 : 1;
  if (a.currency !== b.currency) return a.currency < b.currency ? -1 : 1;
  return 0;
}

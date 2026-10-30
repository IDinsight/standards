// Sum order amounts per customer, largest total first; equal totals by name.
export function totalsByCustomer(orders) {
  const totals = new Map();
  for (const order of orders) {
    totals.set(order.customer, (totals.get(order.customer) ?? 0) + order.amountCents);
  }
  return [...totals]
    .map(([customer, totalCents]) => ({ customer, totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents || a.customer.localeCompare(b.customer));
}

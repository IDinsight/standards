export function summarize(invoices) {
  const byCustomer = new Map();
  let total = 0;
  for (const invoice of invoices) {
    byCustomer.set(invoice.customer, (byCustomer.get(invoice.customer) ?? 0) + invoice.amount);
    total += invoice.amount;
  }
  const lines = [...byCustomer.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([customer, amount]) => `${customer}: ${amount}`);
  lines.push(`Total: ${total}`);
  return lines.join('\n');
}

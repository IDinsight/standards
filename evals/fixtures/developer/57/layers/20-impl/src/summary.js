export function summarizeMonth(records, month) {
  const totals = new Map();
  for (const record of records) {
    if (!record.date.startsWith(month)) continue;
    totals.set(record.category, (totals.get(record.category) ?? 0) + record.amountCents);
  }
  const categories = [...totals.keys()].sort().map((name) => ({ name, totalCents: totals.get(name) }));
  const totalCents = categories.reduce((sum, category) => sum + category.totalCents, 0);
  return { month, categories, totalCents };
}

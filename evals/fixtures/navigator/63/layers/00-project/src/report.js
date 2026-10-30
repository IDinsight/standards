export function categoryReport(ledger) {
  const totals = new Map();
  for (const { category, amount } of ledger.all()) {
    totals.set(category, (totals.get(category) ?? 0) + amount);
  }
  return [...totals]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, total]) => ({ category, total }));
}

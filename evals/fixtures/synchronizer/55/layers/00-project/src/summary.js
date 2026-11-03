export function totalsByCategory(entries) {
  const totals = new Map();
  for (const entry of entries) {
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount);
  }
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function formatTotals(totals) {
  return totals.map(([category, amount]) => `${category}\t${amount.toFixed(2)}`).join('\n');
}

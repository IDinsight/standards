export function summarize(records) {
  const totals = new Map();
  for (const { region, amount } of records) {
    totals.set(region, (totals.get(region) ?? 0) + Number(amount));
  }
  return [...totals]
    .map(([region, total]) => ({ region, total }))
    .sort((left, right) => left.region.localeCompare(right.region));
}

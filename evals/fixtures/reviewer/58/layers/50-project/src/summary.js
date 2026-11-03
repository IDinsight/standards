export function filterByDate(entries, { from = null, to = null } = {}) {
  return entries.filter((entry) => (from === null || entry.date >= from) && (to === null || entry.date <= to));
}

export function summarize(entries, by = 'project') {
  const totals = new Map();
  for (const entry of entries) {
    const key = by === 'day' ? entry.date : entry.project;
    totals.set(key, (totals.get(key) ?? 0) + entry.hours);
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, hours]) => ({ key, hours }));
}

export function formatSummary(rows) {
  const total = rows.reduce((sum, row) => sum + row.hours, 0);
  const width = Math.max(5, ...rows.map((row) => row.key.length));
  const line = (label, hours) => `${label.padEnd(width)}  ${hours.toFixed(2).padStart(7)}`;
  return [...rows.map((row) => line(row.key, row.hours)), line('TOTAL', total)].join('\n');
}

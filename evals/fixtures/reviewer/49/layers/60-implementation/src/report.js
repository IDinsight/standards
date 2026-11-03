// Totals minutes per project, sorted by project name. With `since`
// (YYYY-MM-DD), entries dated before that day are left out; ISO dates compare
// correctly as strings.
export function summarize(entries, { since } = {}) {
  const totals = new Map();
  for (const entry of entries) {
    if (since && entry.date < since) continue;
    totals.set(entry.project, (totals.get(entry.project) ?? 0) + entry.minutes);
  }
  return [...totals].sort(([a], [b]) => a.localeCompare(b));
}

export function formatReport(rows) {
  return rows.map(([project, minutes]) => `${project}\t${(minutes / 60).toFixed(2)}h`).join('\n');
}

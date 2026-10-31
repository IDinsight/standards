// Totals minutes per project, sorted by project name.
export function summarize(entries) {
  const totals = new Map();
  for (const entry of entries) {
    totals.set(entry.project, (totals.get(entry.project) ?? 0) + entry.minutes);
  }
  return [...totals].sort(([a], [b]) => a.localeCompare(b));
}

export function formatReport(rows) {
  return rows.map(([project, minutes]) => `${project}\t${(minutes / 60).toFixed(2)}h`).join('\n');
}

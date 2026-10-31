// Total logged hours per project, sorted by project name. With `since`
// (YYYY-MM-DD), only entries dated on or after that day are counted.
export function summarize(entries, { since } = {}) {
  const totals = new Map();
  for (const entry of entries) {
    if (since !== undefined && entry.date < since) continue;
    totals.set(entry.project, (totals.get(entry.project) ?? 0) + entry.hours);
  }
  return [...totals]
    .map(([project, hours]) => ({ project, hours }))
    .sort((a, b) => a.project.localeCompare(b.project));
}

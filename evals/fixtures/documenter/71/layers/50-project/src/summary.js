// Total logged hours per project, sorted by project name.
export function summarize(entries) {
  const totals = new Map();
  for (const entry of entries) {
    totals.set(entry.project, (totals.get(entry.project) ?? 0) + entry.hours);
  }
  return [...totals]
    .map(([project, hours]) => ({ project, hours }))
    .sort((a, b) => a.project.localeCompare(b.project));
}

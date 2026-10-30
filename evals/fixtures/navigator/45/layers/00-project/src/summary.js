// Aggregate parsed entries and format them for the terminal.

export function totalsByProject(entries) {
  const totals = new Map();
  for (const { project, hours } of entries) {
    totals.set(project, (totals.get(project) ?? 0) + hours);
  }
  return [...totals]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([project, hours]) => ({ project, hours }));
}

export function formatSummary(rows) {
  return rows.map((row) => `${row.project.padEnd(16)} ${row.hours.toFixed(2)}`).join('\n');
}

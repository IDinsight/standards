import { addDays, weekStart } from './week.js';

const round = (value) => Math.round(value * 100) / 100;

// The Monday and Sunday of the week that contains anyDate.
export function weekRange(anyDate) {
  const start = weekStart(anyDate);
  return { start, end: addDays(start, 6) };
}

export function weeklyTotal(entries, anyDate) {
  const start = weekStart(anyDate);
  const next = addDays(start, 7);
  const hours = entries
    .filter((entry) => entry.date >= start && entry.date < next)
    .reduce((sum, entry) => sum + entry.hours, 0);
  return { week: start, hours: round(hours) };
}

export function projectTotals(entries, anyDate) {
  const { start, end } = weekRange(anyDate);
  const totals = new Map();
  for (const entry of entries) {
    if (entry.date < start || entry.date > end) continue;
    totals.set(entry.project, (totals.get(entry.project) ?? 0) + entry.hours);
  }
  return [...totals]
    .map(([project, hours]) => ({ project, hours: round(hours) }))
    .sort((a, b) => b.hours - a.hours || a.project.localeCompare(b.project));
}

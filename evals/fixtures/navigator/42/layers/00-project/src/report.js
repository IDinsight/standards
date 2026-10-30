import { addDays, weekStart } from './week.js';

const round = (value) => Math.round(value * 100) / 100;

export function weeklyTotal(entries, anyDate) {
  const start = weekStart(anyDate);
  const next = addDays(start, 7);
  const hours = entries
    .filter((entry) => entry.date >= start && entry.date < next)
    .reduce((sum, entry) => sum + entry.hours, 0);
  return { week: start, hours: round(hours) };
}

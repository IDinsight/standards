/**
 * Summarize time entries.
 *
 * @param {{ date: string, minutes: number }[]} entries entries with ISO dates (YYYY-MM-DD)
 * @returns {{ totalMinutes: number, byDay: Record<string, number> }}
 */
export function summarize(entries) {
  const byDay = new Map();
  let totalMinutes = 0;
  for (const entry of entries) {
    if (!Number.isInteger(entry.minutes) || entry.minutes < 0) {
      throw new RangeError(`Invalid minutes for ${entry.date}: ${entry.minutes}`);
    }
    totalMinutes += entry.minutes;
    byDay.set(entry.date, (byDay.get(entry.date) ?? 0) + entry.minutes);
  }
  const days = [...byDay].sort(([left], [right]) => left.localeCompare(right));
  return { totalMinutes, byDay: Object.fromEntries(days) };
}

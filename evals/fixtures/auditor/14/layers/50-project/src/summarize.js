import { LEVELS } from './levels.js';

export function summarize(entries, { level = 'debug', since = null, top = 5 } = {}) {
  const minimum = LEVELS.indexOf(level);
  const counts = Object.fromEntries(LEVELS.map((name) => [name, 0]));
  const messages = new Map();
  let total = 0;
  for (const entry of entries) {
    if (LEVELS.indexOf(entry.level) < minimum) continue;
    if (since !== null && entry.time < since) continue;
    counts[entry.level] += 1;
    total += 1;
    messages.set(entry.message, (messages.get(entry.message) ?? 0) + 1);
  }
  const frequent = [...messages]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, top)
    .map(([message, count]) => ({ message, count }));
  return { total, counts, frequent };
}

export function formatSummary(summary) {
  const lines = [`total: ${summary.total}`];
  for (const [level, count] of Object.entries(summary.counts)) lines.push(`${level.padEnd(6)}${count}`);
  if (summary.frequent.length) {
    lines.push('', 'most frequent:');
    for (const { message, count } of summary.frequent) lines.push(`${String(count).padStart(5)}  ${message}`);
  }
  return lines.join('\n');
}

const LEVELS = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
const LINE = /^\S+\s+(ERROR|WARN|INFO|DEBUG)\b/;

export function tally(text) {
  const counts = Object.fromEntries(LEVELS.map((level) => [level, 0]));
  let total = 0;
  let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    total += 1;
    const match = LINE.exec(line);
    if (match) counts[match[1]] += 1;
    else skipped += 1;
  }
  return { total, counts, skipped };
}

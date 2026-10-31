const ENTRY = /^(\d{4}-\d{2}-\d{2})\s+(\S+)\s+(\S+)$/;
const DURATION = /^(?:(\d+)h)?(?:(\d+)m)?$/;

// Whole minutes for `2h`, `45m`, or `1h05m`; null for anything else.
export function parseDuration(text) {
  const match = DURATION.exec(text);
  if (!match) return null;
  const [, hours, minutes] = match;
  if (hours === undefined && minutes === undefined) return null;
  if (hours !== undefined && minutes !== undefined && Number(minutes) > 59) return null;
  return Number(hours ?? 0) * 60 + Number(minutes ?? 0);
}

// One log line: { skip: true } for blank and comment lines, the parsed entry,
// or null when the line does not have the expected shape.
export function parseLine(line) {
  const text = line.trim();
  if (text === '' || text.startsWith('#')) return { skip: true };
  const match = ENTRY.exec(text);
  if (!match) return null;
  const minutes = parseDuration(match[3]);
  if (minutes === null) return null;
  return { date: match[1], project: match[2], minutes };
}

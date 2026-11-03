// Parse worklog lines of the form `YYYY-MM-DD <hours> [project words]`.

export function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const [date, hours, ...rest] = trimmed.split(/\s+/);
  const value = Number(hours);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid entry: ${line}`);
  }
  return { date, hours: value, project: rest.join(' ') || 'general' };
}

export function parseLog(text) {
  return text.split('\n').map(parseLine).filter(Boolean);
}

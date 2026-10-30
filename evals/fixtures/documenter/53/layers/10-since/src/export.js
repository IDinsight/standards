const LEVELS = ['debug', 'info', 'warn', 'error'];

export function parseLine(line) {
  const match = /^(\S+) (DEBUG|INFO|WARN|ERROR) (.*)$/.exec(line);
  if (!match) return null;
  return { time: match[1], level: match[2].toLowerCase(), message: match[3] };
}

export function exportEntries(text, { minLevel = 'info', since = null } = {}) {
  const threshold = LEVELS.indexOf(minLevel);
  if (threshold === -1) throw new Error(`unknown level: ${minLevel}`);
  const cutoff = since === null ? null : Date.parse(since);
  if (cutoff !== null && Number.isNaN(cutoff)) throw new Error(`invalid since value: ${since}`);
  return text.split('\n')
    .map(parseLine)
    .filter((entry) => entry && LEVELS.indexOf(entry.level) >= threshold)
    .filter((entry) => cutoff === null || Date.parse(entry.time) >= cutoff)
    .map((entry) => JSON.stringify(entry))
    .join('\n');
}

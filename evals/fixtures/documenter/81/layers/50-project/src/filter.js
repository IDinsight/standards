export const LEVELS = ['debug', 'info', 'warn', 'error'];

const LINE = /^(\S+)\s+\[(\w+)\]\s+(.*)$/;

export function parseLine(line) {
  const match = LINE.exec(line);
  if (!match || !LEVELS.includes(match[2].toLowerCase())) return null;
  return { time: match[1], level: match[2].toLowerCase(), message: match[3] };
}

export function filterLines(lines, { level = 'warn', grep = null } = {}) {
  const min = LEVELS.indexOf(level);
  if (min === -1) throw new Error(`unknown level: ${level}`);
  return lines.filter((line) => {
    const entry = parseLine(line);
    if (!entry || LEVELS.indexOf(entry.level) < min) return false;
    return grep === null || entry.message.includes(grep);
  });
}

const LINE = /^(\S+)\s+(DEBUG|INFO|WARN|ERROR)\s+(.*)$/;

export function parseLine(line) {
  const match = LINE.exec(line.trim());
  if (!match) return null;
  const time = Date.parse(match[1]);
  if (Number.isNaN(time)) return null;
  return { time, level: match[2].toLowerCase(), message: match[3] };
}

export function parseLog(text) {
  return text.split(/\r?\n/).map(parseLine).filter(Boolean);
}

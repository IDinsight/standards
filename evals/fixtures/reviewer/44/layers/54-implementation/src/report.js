import { parseLine } from './parse.js';

export class LogError extends Error {
  constructor(lineNumber, line) {
    super(`line ${lineNumber}: cannot parse "${line}"`);
    this.name = 'LogError';
    this.lineNumber = lineNumber;
  }
}

// Totals per project as [project, minutes] pairs, sorted by project name.
export function summarize(text) {
  const totals = new Map();
  text.split(/\r?\n/).forEach((line, index) => {
    const entry = parseLine(line);
    if (entry === null) throw new LogError(index + 1, line);
    if (entry.skip) return;
    totals.set(entry.project, (totals.get(entry.project) ?? 0) + entry.minutes);
  });
  return [...totals].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

export function formatMinutes(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

export function renderReport(rows) {
  return rows.map(([project, minutes]) => `${project}\t${formatMinutes(minutes)}`).join('\n');
}

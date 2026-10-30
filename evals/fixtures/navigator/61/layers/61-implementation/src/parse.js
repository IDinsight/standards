import { parseDuration } from './duration.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseLine(line) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 3) {
    throw new Error('expected a date, a duration, and a description');
  }
  const [date, duration, ...rest] = parts;
  if (!DATE.test(date)) {
    throw new Error(`invalid date "${date}"`);
  }
  const minutes = parseDuration(duration);
  const tags = rest.filter((word) => word.startsWith('#')).map((word) => word.slice(1));
  const description = rest.filter((word) => !word.startsWith('#')).join(' ');
  return { date, minutes, description, tags };
}

export function parseEntries(text) {
  const entries = [];
  const errors = [];
  text.split('\n').forEach((raw, index) => {
    if (raw.trim() === '') return;
    try {
      entries.push(parseLine(raw));
    } catch (error) {
      errors.push({ line: index + 1, message: error.message });
    }
  });
  return { entries, errors };
}

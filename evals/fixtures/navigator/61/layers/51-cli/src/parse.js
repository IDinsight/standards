import { parseDuration } from './duration.js';

export function parseLine(line) {
  const [date, duration, ...rest] = line.trim().split(/\s+/);
  return { date, minutes: parseDuration(duration), description: rest.join(' ') };
}

export function parseEntries(text) {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map(parseLine);
}

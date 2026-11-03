const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError(`Expected YYYY-MM-DD, got ${value}`);
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function daysBetween(from, to) {
  return Math.round((parseDay(to) - parseDay(from)) / DAY_MS);
}

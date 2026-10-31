const UNITS = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

// Parse strings such as "1m30s", "500ms", or "1.5h" into milliseconds.
export function parseDuration(text) {
  const input = String(text).trim();
  if (input === '') throw new TypeError('empty duration');
  const pattern = /(\d+(?:\.\d+)?)(ms|s|m|h|d)/g;
  let total = 0;
  let consumed = 0;
  let match;
  while ((match = pattern.exec(input)) !== null) {
    if (match.index !== consumed) throw new TypeError(`invalid duration: ${input}`);
    total += Number(match[1]) * UNITS[match[2]];
    consumed = pattern.lastIndex;
  }
  if (consumed === 0 || consumed !== input.length) throw new TypeError(`invalid duration: ${input}`);
  return total;
}

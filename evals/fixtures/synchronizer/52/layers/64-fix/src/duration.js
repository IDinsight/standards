const UNIT_SECONDS = { h: 3600, m: 60, s: 1 };

// Parse an interval such as "1h30m", "45s", or "2h" into seconds.
// Returns null when the text is not a valid duration.
export function parseDuration(text) {
  const value = text.trim().toLowerCase();
  let total = 0;
  let consumed = 0;
  for (const match of value.matchAll(/(\d+)([hms])/g)) {
    if (match.index !== consumed) return null;
    total += Number(match[1]) * UNIT_SECONDS[match[2]];
    consumed += match[0].length;
  }
  return value.length > 0 && consumed === value.length && total > 0 ? total : null;
}

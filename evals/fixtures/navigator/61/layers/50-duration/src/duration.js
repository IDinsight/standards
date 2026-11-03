const PATTERN = /^(?:(\d+)h)?(?:(\d+)m)?$/;

export function parseDuration(text) {
  const match = PATTERN.exec(text);
  if (!match || (match[1] === undefined && match[2] === undefined)) {
    throw new Error(`invalid duration "${text}"`);
  }
  return Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
}

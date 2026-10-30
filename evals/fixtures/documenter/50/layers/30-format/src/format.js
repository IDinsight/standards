// One JSON object per input, written as a single line (JSON Lines).
export function toJsonLine(counts, name) {
  return JSON.stringify({ file: name ?? null, lines: counts.lines, words: counts.words, chars: counts.chars });
}

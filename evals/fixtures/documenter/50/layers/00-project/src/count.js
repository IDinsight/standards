// Count lines, words, and characters the way most people read a text file:
// a final line without a trailing newline still counts as a line.
export function count(text) {
  const lines = text === '' ? 0 : text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = [...text].length;
  return { lines, words, chars };
}

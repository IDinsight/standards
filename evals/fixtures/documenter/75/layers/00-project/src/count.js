// Count lines, words, and characters in a string.
export function tally(text) {
  const lines = text === '' ? 0 : text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = [...text].length;
  return { lines, words, chars };
}

export const FIELDS = ['lines', 'words', 'chars'];

export const COUNT_MODES = ['lines', 'words', 'chars'];

// Count units of `text`. A final line without a trailing newline still counts
// as a line. Characters are Unicode code points, not UTF-16 units.
export function count(text, { mode = 'lines' } = {}) {
  if (text === '') return 0;
  switch (mode) {
    case 'lines': {
      const parts = text.split('\n');
      return text.endsWith('\n') ? parts.length - 1 : parts.length;
    }
    case 'words':
      return text.split(/\s+/).filter(Boolean).length;
    case 'chars':
      return [...text].length;
    default:
      throw new Error(`unknown mode: ${mode}`);
  }
}

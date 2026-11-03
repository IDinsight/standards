export const FORMATS = ['text', 'json'];

export function render(result, format) {
  if (format === 'json') return JSON.stringify(result) + '\n';
  const lines = Object.entries(result.counts).map(([level, count]) => level.padEnd(5) + ' ' + count);
  lines.push('total ' + result.total);
  if (result.skipped) lines.push('skipped ' + result.skipped);
  return lines.join('\n') + '\n';
}

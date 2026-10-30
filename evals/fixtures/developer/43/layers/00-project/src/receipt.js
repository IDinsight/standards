import { formatAmount } from './format.js';

const WIDTH = 32;

export function renderReceipt(lines, currency = '$') {
  const rows = lines.map(({ label, cents }) => pad(label, formatAmount(cents, currency)));
  const total = lines.reduce((sum, line) => sum + line.cents, 0);
  return [...rows, '-'.repeat(WIDTH), pad('Total', formatAmount(total, currency))].join('\n');
}

function pad(left, right) {
  const gap = Math.max(1, WIDTH - left.length - right.length);
  return `${left}${' '.repeat(gap)}${right}`;
}

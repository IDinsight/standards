import { formatCents } from './format.js';
import { orderTotals } from './totals.js';

export function run(argv, { readFile }) {
  const [file] = argv;
  if (!file) {
    return { code: 1, stdout: '', stderr: 'usage: invoice <order.json>\n' };
  }
  let order;
  try {
    order = JSON.parse(readFile(file));
  } catch (error) {
    return { code: 1, stdout: '', stderr: `invoice: cannot read ${file}: ${error.message}\n` };
  }
  const totals = orderTotals(order);
  const lines = [
    `Subtotal: ${formatCents(totals.subtotalCents)}`,
    `Tax: ${formatCents(totals.taxCents)}`,
    `Total: ${formatCents(totals.totalCents)}`,
  ];
  return { code: 0, stdout: `${lines.join('\n')}\n`, stderr: '' };
}

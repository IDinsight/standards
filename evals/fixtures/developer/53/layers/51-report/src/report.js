export function formatReport(totals) {
  const width = Math.max(8, ...totals.map(([category]) => category.length));
  const row = (label, amount) => label.padEnd(width) + '  ' + amount.toFixed(2).padStart(10);
  const sum = totals.reduce((total, [, amount]) => total + amount, 0);
  return [...totals.map(([category, amount]) => row(category, amount)), row('TOTAL', sum)].join('\n');
}

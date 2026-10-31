export function summarize(rows, column) {
  const values = rows
    .map((row) => row[column])
    .filter((value) => value !== undefined && value !== '')
    .map(Number);
  if (values.some((value) => Number.isNaN(value))) {
    throw new Error(`column ${column} has non-numeric values`);
  }
  const sum = values.reduce((total, value) => total + value, 0);
  return { count: values.length, sum, mean: values.length ? sum / values.length : 0 };
}

export function formatSummary(summary, format = 'text') {
  if (format === 'json') return JSON.stringify(summary);
  return [
    `count ${summary.count}`,
    `sum ${summary.sum.toFixed(2)}`,
    `mean ${summary.mean.toFixed(2)}`,
  ].join('\n');
}

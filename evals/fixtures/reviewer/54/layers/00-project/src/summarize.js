const round = (n) => Math.round(n * 100) / 100;

export function summarize(rows, column) {
  const values = [];
  let skipped = 0;
  for (const row of rows) {
    const raw = row[column];
    const value = raw === undefined || raw === '' ? NaN : Number(raw);
    if (Number.isFinite(value)) values.push(value);
    else skipped += 1;
  }
  if (values.length === 0) {
    return { count: 0, skipped, sum: 0, min: null, max: null, mean: null };
  }
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    count: values.length,
    skipped,
    sum: round(sum),
    min: Math.min(...values),
    max: Math.max(...values),
    mean: round(sum / values.length),
  };
}

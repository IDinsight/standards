/** Render rows as a plain-text table with aligned columns. */
export function formatTable(rows, columns) {
  const widths = columns.map((column) =>
    Math.max(column.length, ...rows.map((row) => String(row[column]).length)),
  );
  const line = (values) =>
    values.map((value, index) => String(value).padEnd(widths[index])).join('  ').trimEnd();
  return [
    line(columns),
    line(widths.map((width) => '-'.repeat(width))),
    ...rows.map((row) => line(columns.map((column) => row[column]))),
  ].join('\n');
}

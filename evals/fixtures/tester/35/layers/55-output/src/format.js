// Render summary rows: tab-separated lines for people, JSON for other tools.
export function formatText(rows) {
  return rows.map((row) => `${row.customer}\t${row.currency}\t${row.total.toFixed(2)}\n`).join('');
}

export function formatJson(rows) {
  return `${JSON.stringify(rows, null, 2)}\n`;
}

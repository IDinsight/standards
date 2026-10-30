const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (ch) => ESCAPES[ch]);

export function reportRows(store) {
  const byOwner = new Map();
  for (const record of store.list()) {
    const row = byOwner.get(record.owner) ?? { owner: record.owner, open: 0, closed: 0 };
    if (record.status === 'closed') row.closed += 1;
    else row.open += 1;
    byOwner.set(record.owner, row);
  }
  return [...byOwner.values()].sort((a, b) => a.owner.localeCompare(b.owner));
}

export function renderReportsPage(rows) {
  const body = rows
    .map((row) => `    <tr><td>${escapeHtml(row.owner)}</td><td>${row.open}</td><td>${row.closed}</td></tr>`)
    .join('\n');
  return [
    '<h1>Reports</h1>',
    '<table>',
    '  <thead><tr><th>Owner</th><th>Open</th><th>Closed</th></tr></thead>',
    '  <tbody>',
    body,
    '  </tbody>',
    '</table>',
  ].join('\n');
}

const LABELS = [
  ['displayName', 'Name'],
  ['email', 'Email'],
  ['role', 'Role'],
  ['suspendedReason', 'Suspended reason'],
  ['updatedAt', 'Last updated'],
];

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderAdminRecord(record) {
  const rows = LABELS.map(([key, label]) => {
    const value = record[key];
    const shown = value === null || value === undefined
      ? '<span class="empty">—</span>'
      : escapeHtml(String(value));
    return `  <tr><th>${label}</th><td>${shown}</td></tr>`;
  });
  return [`<table class="admin-record" data-id="${escapeHtml(String(record.id))}">`, ...rows, '</table>'].join('\n');
}

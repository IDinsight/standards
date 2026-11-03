// HTML detail view for one admin record.

const FIELDS = [
  ['title', 'Title'],
  ['owner', 'Owner'],
  ['status', 'Status'],
  ['reviewedAt', 'Reviewed'],
];

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function cell(value) {
  return value === null || value === undefined ? '\u2014' : escapeHtml(String(value));
}

export function renderRecord(record) {
  const rows = FIELDS.map(([key, label]) => `  <tr><th>${label}</th><td>${cell(record[key])}</td></tr>`);
  return [`<table class="admin-record" data-id="${escapeHtml(String(record.id))}">`, ...rows, '</table>'].join('\n');
}

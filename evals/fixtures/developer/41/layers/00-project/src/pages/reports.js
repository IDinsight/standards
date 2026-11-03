import { summarize } from '../reports.js';

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (ch) => ENTITIES[ch]);

export function renderReportsPage(records) {
  const rows = summarize(records)
    .map(({ region, total }) => `<tr><td>${escapeHtml(region)}</td><td>${total}</td></tr>`)
    .join('');
  return `<h1>Reports</h1><table><thead><tr><th>Region</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`;
}

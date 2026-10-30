import { getReport, listReports } from './reports.js';
import { summaryDownload } from './summary.js';

function json(status, value) {
  return { status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) };
}

export function handle(method, path) {
  if (method !== 'GET') return { status: 405, headers: {}, body: '' };
  if (path === '/reports') return json(200, listReports());
  const parts = path.split('/');
  if (parts.length === 4 && parts[1] === 'reports' && parts[3] === 'summary') {
    const report = getReport(parts[2]);
    return report ? summaryDownload(report) : json(404, { error: 'not found' });
  }
  return json(404, { error: 'not found' });
}

import { createReport, getReport, listReports, publishReport } from './store.js';

const MAX_ROWS = 1000;

const reply = (status, body) => ({ status, body });

function parseId(segment) {
  const id = Number(segment);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function listing(report) {
  return { id: report.id, title: report.title, status: report.status };
}

export function handle(method, url, body = null) {
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'reports') return reply(404, { error: 'not found' });

  if (parts.length === 1) {
    if (method === 'GET') {
      const status = searchParams.get('status');
      if (status && !['draft', 'published'].includes(status)) {
        return reply(400, { error: 'status must be draft or published' });
      }
      return reply(200, { reports: listReports({ status }).map(listing) });
    }
    if (method === 'POST') {
      const title = typeof body?.title === 'string' ? body.title.trim() : '';
      if (!title) return reply(400, { error: 'title is required' });
      const rows = Array.isArray(body.rows) ? body.rows : [];
      return reply(201, createReport({ title, rows }));
    }
    return reply(405, { error: 'method not allowed' });
  }

  const id = parseId(parts[1]);
  if (id === null) return reply(400, { error: 'invalid report id' });
  const report = getReport(id);
  if (!report) return reply(404, { error: 'report not found' });

  if (parts.length === 2 && method === 'GET') return reply(200, report);
  if (parts.length === 3 && parts[2] === 'rows' && method === 'GET') {
    const limit = Number(searchParams.get('limit') ?? 100);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_ROWS) {
      return reply(400, { error: `limit must be between 1 and ${MAX_ROWS}` });
    }
    return reply(200, { rows: report.rows.slice(0, limit), total: report.rows.length });
  }
  if (parts.length === 3 && parts[2] === 'publish' && method === 'POST') {
    if (report.status === 'published') return reply(409, { error: 'report already published' });
    return reply(200, publishReport(id));
  }
  return reply(404, { error: 'not found' });
}

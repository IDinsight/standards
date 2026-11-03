import { bearerToken } from './auth.js';

const summary = ({ id, title, ownerId }) => ({ id, title, ownerId });

export function createRouter({ sessions, memberships, reports }) {
  return function handle({ method, path, headers = {}, body = {} }) {
    const userId = sessions.userFor(bearerToken(headers));
    if (userId === null) return { status: 401, body: { error: 'unauthorized' } };

    const parts = path.split('/').filter(Boolean);

    if (parts.length === 3 && parts[0] === 'workspaces' && parts[2] === 'reports') {
      const workspaceId = Number(parts[1]);
      if (!memberships.isMember(workspaceId, userId)) return { status: 403, body: { error: 'forbidden' } };
      if (method === 'GET') return { status: 200, body: reports.listForWorkspace(workspaceId).map(summary) };
      if (method === 'POST') {
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        if (!title) return { status: 400, body: { error: 'title is required' } };
        const report = reports.create({ workspaceId, ownerId: userId, title, rows: body.rows ?? [] });
        return { status: 201, body: report };
      }
      return { status: 405, body: { error: 'method not allowed' } };
    }

    if (parts.length === 2 && parts[0] === 'reports' && method === 'GET') {
      const report = reports.get(Number(parts[1]));
      if (!report || !memberships.isMember(report.workspaceId, userId)) {
        return { status: 404, body: { error: 'not found' } };
      }
      return { status: 200, body: report };
    }

    return { status: 404, body: { error: 'not found' } };
  };
}

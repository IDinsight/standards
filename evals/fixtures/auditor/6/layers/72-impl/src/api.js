import { signToken, verifyToken } from './tokens.js';

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const SHARE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createApp({ store, users, secret, now = () => Date.now() }) {
  function authenticate(headers) {
    const match = /^Bearer (\S+)$/.exec(headers.authorization ?? '');
    const claims = match ? verifyToken(match[1], secret, now()) : null;
    return claims?.scope === 'session' ? claims : null;
  }

  function openShared(token) {
    const claims = verifyToken(token, secret, now());
    if (!claims?.scope.startsWith('share:')) return { status: 404, body: { error: 'not found' } };
    const report = store.get(claims.scope.slice('share:'.length));
    if (!report || report.ownerId !== claims.userId) return { status: 404, body: { error: 'not found' } };
    return { status: 200, body: { id: report.id, title: report.title, rows: report.rows } };
  }

  return function handle({ method, path, headers = {}, body = {} }) {
    if (method === 'POST' && path === '/sessions') {
      if (!users.has(body.userId) || users.get(body.userId) !== body.password) {
        return { status: 401, body: { error: 'invalid credentials' } };
      }
      const expiresAt = now() + SESSION_TTL_MS;
      const token = signToken({ userId: body.userId, expiresAt }, secret);
      return { status: 201, body: { token, expiresAt } };
    }

    const sharedMatch = /^\/shared\/([^/]+)$/.exec(path);
    if (method === 'GET' && sharedMatch) return openShared(sharedMatch[1]);

    const session = authenticate(headers);
    if (!session) return { status: 401, body: { error: 'unauthorized' } };

    if (method === 'POST' && path === '/reports') {
      const report = store.create(session.userId, body.title, body.rows ?? []);
      return { status: 201, body: report };
    }

    if (method === 'GET' && path === '/reports') {
      return { status: 200, body: { reports: store.listByOwner(session.userId) } };
    }

    const reportMatch = /^\/reports\/([^/]+)$/.exec(path);
    if (method === 'GET' && reportMatch) {
      const report = store.get(reportMatch[1]);
      if (!report || report.ownerId !== session.userId) return { status: 404, body: { error: 'not found' } };
      return { status: 200, body: report };
    }

    const shareMatch = /^\/reports\/([^/]+)\/share$/.exec(path);
    if (method === 'POST' && shareMatch) {
      const report = store.get(shareMatch[1]);
      if (!report || report.ownerId !== session.userId) return { status: 404, body: { error: 'not found' } };
      const expiresAt = now() + SHARE_TTL_MS;
      const token = signToken({ userId: session.userId, expiresAt, scope: `share:${report.id}` }, secret);
      return { status: 201, body: { url: `/shared/${token}`, expiresAt } };
    }

    return { status: 404, body: { error: 'not found' } };
  };
}

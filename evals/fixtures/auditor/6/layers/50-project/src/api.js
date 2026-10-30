import { signToken, verifyToken } from './tokens.js';

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function createApp({ store, users, secret, now = () => Date.now() }) {
  function authenticate(headers) {
    const match = /^Bearer (\S+)$/.exec(headers.authorization ?? '');
    return match ? verifyToken(match[1], secret, now()) : null;
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

    const session = authenticate(headers);
    if (!session) return { status: 401, body: { error: 'unauthorized' } };

    if (method === 'POST' && path === '/reports') {
      const report = store.create(session.userId, body.title, body.rows ?? []);
      return { status: 201, body: report };
    }

    const reportMatch = /^\/reports\/([^/]+)$/.exec(path);
    if (method === 'GET' && reportMatch) {
      const report = store.get(reportMatch[1]);
      if (!report || report.ownerId !== session.userId) return { status: 404, body: { error: 'not found' } };
      return { status: 200, body: report };
    }

    return { status: 404, body: { error: 'not found' } };
  };
}

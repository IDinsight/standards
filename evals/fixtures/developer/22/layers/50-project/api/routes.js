import { authenticate, requireScope } from './auth.js';
import { sessionCookieHeader } from '../shared/session.js';

const reply = (status, body = null, headers = {}) => ({ status, headers, body });

export function createApi({ store, users, jobs }) {
  return function handle({ method, path, headers = {}, body = {} }) {
    if (method === 'POST' && path === '/login') {
      const user = users.authenticate(body.email, body.password);
      if (!user) return reply(401, { error: 'invalid credentials' });
      const id = store.create(user.id, { scopes: user.scopes });
      return reply(204, null, { 'set-cookie': sessionCookieHeader(id) });
    }

    const principal = authenticate(headers, store);
    if (!principal) return reply(401, { error: 'not signed in' });

    if (method === 'GET' && path === '/me') {
      return reply(200, { userId: principal.userId });
    }
    if (method === 'POST' && path === '/jobs/complete') {
      if (!requireScope(principal, 'jobs:write')) return reply(403, { error: 'forbidden' });
      jobs.push(body.jobId);
      return reply(204);
    }
    return reply(404, { error: 'not found' });
  };
}

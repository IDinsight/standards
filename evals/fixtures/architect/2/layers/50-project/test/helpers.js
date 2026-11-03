import { createApp } from '../api/src/app.js';
import { AuditLog } from '../api/src/audit.js';
import { loadConfig } from '../api/src/config.js';
import { LoginLimiter } from '../api/src/ratelimit.js';
import { SessionStore } from '../api/src/sessions.js';
import { UserDirectory, hashPassword } from '../api/src/users.js';

const USERS = [
  { id: 1, username: 'ada', role: 'member', passwordHash: hashPassword('correct horse') },
  { id: 2, username: 'grace', role: 'admin', passwordHash: hashPassword('battery staple') },
  { id: 3, username: 'report-worker', role: 'service', passwordHash: hashPassword('worker pass') },
];

export function createTestApp() {
  const clock = { value: Date.parse('2026-09-01T08:00:00Z') };
  const now = () => clock.value;
  const config = loadConfig({ SESSION_SECRET: 'test-secret', SECURE_COOKIES: 'false' });
  const sessions = new SessionStore({ ttlSeconds: config.sessionTtlSeconds, now });
  const audit = new AuditLog({ now });
  const expenses = [];
  const reports = [];
  const handle = createApp({
    config, users: new UserDirectory(USERS), sessions, limiter: new LoginLimiter({ now }), audit, expenses, reports,
  });
  return { handle, config, sessions, audit, expenses, reports, clock };
}

export async function signIn(handle, username, password) {
  const response = await handle({ method: 'POST', path: '/login', headers: {}, body: { username, password } });
  return { cookie: response.headers['set-cookie'].split(';')[0], csrfToken: response.body.csrfToken };
}

function toFetchResponse(result) {
  const headers = new Map(Object.entries(result.headers ?? {}));
  return {
    status: result.status,
    ok: result.status >= 200 && result.status < 300,
    headers: { get: (name) => headers.get(name.toLowerCase()) ?? null },
    json: async () => result.body,
  };
}

// A fetch that calls the in-process app. With a jar it behaves like a browser:
// it stores the cookie from Set-Cookie and sends it on credentialed requests.
export function connect(handle, { jar = null } = {}) {
  return async (url, init = {}) => {
    const { pathname } = new URL(url);
    const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
    if (jar && init.credentials === 'include' && jar.cookie) headers.cookie = jar.cookie;
    const result = await handle({
      method: init.method ?? 'GET',
      path: pathname,
      headers,
      body: init.body === undefined ? undefined : JSON.parse(init.body),
    });
    if (jar && result.headers?.['set-cookie']) {
      const pair = result.headers['set-cookie'].split(';')[0];
      jar.cookie = pair.endsWith('=') ? null : pair;
    }
    return toFetchResponse(result);
  };
}

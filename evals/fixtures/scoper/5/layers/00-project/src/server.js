import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import { parseCookies, sessionCookie } from './cookies.js';
import { SessionStore } from './sessions.js';

const AGENTS = new Map([
  ['ana', { id: 'agent-1', password: 'ana-local' }],
  ['ben', { id: 'agent-2', password: 'ben-local' }],
]);

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let text = '';
  for await (const chunk of req) text += chunk;
  return text ? JSON.parse(text) : {};
}

export function createApp(store = new SessionStore(), { secure = process.env.NODE_ENV === 'production' } = {}) {
  return createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/login') {
      const { username, password } = await readJson(req);
      const agent = AGENTS.get(username);
      if (!agent || agent.password !== password) return send(res, 401, { error: 'invalid credentials' });
      const session = store.create(agent.id);
      res.setHeader('Set-Cookie', sessionCookie(session.id, { secure }));
      return send(res, 200, { agent: agent.id });
    }
    const sid = parseCookies(req.headers.cookie).sid;
    const session = sid ? store.get(sid) : null;
    if (!session) return send(res, 401, { error: 'sign in required' });
    if (req.method === 'GET' && req.url === '/me') return send(res, 200, { agent: session.userId });
    if (req.method === 'POST' && req.url === '/logout') {
      store.destroy(session.id);
      res.setHeader('Set-Cookie', 'sid=; Path=/; Max-Age=0');
      return send(res, 200, { ok: true });
    }
    return send(res, 404, { error: 'not found' });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp().listen(Number(process.env.PORT ?? 3000));
}

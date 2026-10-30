import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

import { createApp } from './app.js';
import { AuditLog } from './audit.js';
import { loadConfig } from './config.js';
import { LoginLimiter } from './ratelimit.js';
import { FileSessionBackend, SessionStore } from './sessions.js';
import { UserDirectory } from './users.js';

const config = loadConfig();
const users = new UserDirectory(JSON.parse(readFileSync(config.usersFile, 'utf8')));
const sessions = new SessionStore({
  backend: new FileSessionBackend(config.sessionFile),
  ttlSeconds: config.sessionTtlSeconds,
});
const audit = new AuditLog({ file: config.auditFile });
const handle = createApp({ config, users, sessions, limiter: new LoginLimiter(), audit });

const cors = {
  'access-control-allow-origin': config.webOrigin,
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': 'content-type, x-csrf-token',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
};

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    res.writeHead(400, { ...cors, 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid JSON' }));
    return;
  }
  const { pathname } = new URL(req.url, 'http://localhost');
  const response = await handle({ method: req.method, path: pathname, headers: req.headers, body });
  res.writeHead(response.status, { ...cors, ...response.headers });
  res.end(response.body === undefined ? undefined : JSON.stringify(response.body));
}).listen(config.port, () => {
  console.log(`tallyhub api listening on ${config.port}`);
});

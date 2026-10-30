import http from 'node:http';

import { consoleMailer } from './mailer.js';
import { MemoryStore } from './store.js';
import { createResetToken } from './tokens.js';

const store = new MemoryStore();

async function readJson(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  try {
    return JSON.parse(body || '{}');
  } catch {
    return {};
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/password-reset') {
    const { userId, email } = await readJson(req);
    if (!userId || !email) {
      res.writeHead(400).end();
      return;
    }
    const token = createResetToken(store, userId);
    await consoleMailer.send({
      to: email,
      subject: 'Reset your password',
      text: 'Use this code to reset your password: ' + token.value,
    });
    res.writeHead(202).end();
    return;
  }
  res.writeHead(404).end();
});

server.listen(Number(process.env.PORT ?? 3000));

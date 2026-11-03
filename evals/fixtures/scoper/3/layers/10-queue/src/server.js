import http from 'node:http';

import { sendResetEmail } from './jobs/sendResetEmail.js';
import { consoleMailer } from './mailer.js';
import { JobQueue } from './queue.js';
import { MemoryStore } from './store.js';
import { createResetToken } from './tokens.js';

const store = new MemoryStore();
const queue = new JobQueue();
const handlers = {
  'send-reset-email': sendResetEmail(consoleMailer),
};

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
    queue.enqueue('send-reset-email', { email, token: token.value });
    res.writeHead(202).end();
    return;
  }
  res.writeHead(404).end();
});

setInterval(() => {
  queue.drain(handlers).then((failed) => {
    for (const job of failed) console.error('[queue] gave up on ' + job.name);
  });
}, 1000).unref();

server.listen(Number(process.env.PORT ?? 3000));

import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';

const MAX_BODY = 64 * 1024;

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('body too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export function createExportServer({ bus, store, logger }) {
  return createServer(async (req, res) => {
    const requestId = randomUUID();
    const log = logger.child({ requestId });
    const url = new URL(req.url, 'http://localhost');
    log.info('request received', { method: req.method, path: url.pathname });
    const reply = (status, body) => send(res, status, body, { 'x-request-id': requestId });

    if (req.method === 'POST' && url.pathname === '/exports') {
      let body;
      try {
        body = await readJson(req);
      } catch {
        return reply(400, { error: 'invalid JSON body' });
      }
      if (typeof body.report !== 'string' || typeof body.callbackUrl !== 'string') {
        return reply(400, { error: 'report and callbackUrl are required' });
      }
      const record = store.create({ report: body.report, callbackUrl: body.callbackUrl });
      bus.publish('export.requested', { exportId: record.id, report: record.report, callbackUrl: record.callbackUrl });
      log.info('export queued', { exportId: record.id });
      return reply(202, { exportId: record.id, status: record.status });
    }

    const match = /^\/exports\/([\w-]+)$/.exec(url.pathname);
    if (req.method === 'GET' && match) {
      const record = store.get(match[1]);
      return record ? reply(200, record) : reply(404, { error: 'not found' });
    }
    return reply(404, { error: 'not found' });
  });
}

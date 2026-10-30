import http from 'node:http';
import { pathToFileURL } from 'node:url';

import { ValidationError, createAppointmentService } from './appointments.js';
import { loadConfig } from './config.js';
import { createMailer } from './mailer.js';
import { createRecordsClient } from './records-client.js';

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

export function createHandler(service) {
  return async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/healthz') return send(res, 200, { ok: true });
      if (req.method === 'GET' && url.pathname === '/appointments') return send(res, 200, await service.upcoming());
      if (req.method === 'POST' && url.pathname === '/appointments') {
        return send(res, 201, await service.book(await readJson(req)));
      }
      const match = /^\/appointments\/([^/]+)$/.exec(url.pathname);
      if (req.method === 'DELETE' && match) {
        const result = await service.cancel(decodeURIComponent(match[1]));
        return result ? send(res, 200, result) : send(res, 404, { error: 'not found' });
      }
      return send(res, 404, { error: 'not found' });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof SyntaxError) {
        return send(res, 400, { error: error.message });
      }
      console.error(error);
      return send(res, 502, { error: 'upstream failure' });
    }
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig();
  const service = createAppointmentService({
    records: createRecordsClient(config.recordsApiUrl),
    mailer: createMailer(config.mailerUrl),
  });
  http.createServer(createHandler(service)).listen(config.port, () => {
    console.log(`booking-api listening on ${config.port}`);
  });
}

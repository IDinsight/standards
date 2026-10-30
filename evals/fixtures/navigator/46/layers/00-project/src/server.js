import http from 'node:http';

import { createSignup } from './handlers/signup.js';
import { SignupStore } from './store.js';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

export function createServer(store = new SignupStore()) {
  return http.createServer(async (req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };

    if (req.method !== 'POST' || req.url !== '/signups') {
      send(404, { errors: ['not found'] });
      return;
    }

    let body;
    try {
      body = await readJson(req);
    } catch {
      send(400, { errors: ['body must be JSON'] });
      return;
    }

    const result = createSignup(store, body);
    send(result.status, result.body);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  createServer().listen(port, () => {
    console.log(`listening on ${port}`);
  });
}

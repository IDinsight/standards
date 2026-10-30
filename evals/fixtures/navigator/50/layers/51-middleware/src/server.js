import http from 'node:http';

import { RATE_LIMIT } from './config.js';
import { rateLimit } from './middleware.js';

const limit = rateLimit(RATE_LIMIT);

export const server = http.createServer((req, res) => {
  limit(req, res, () => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, path: req.url }));
  });
});

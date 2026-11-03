import http from 'node:http';

import { createBreaker } from './breaker.js';
import { loadConfig } from './config.js';
import { createQuoteHandler } from './quotes.js';
import { createRatesClient } from './rates-client.js';

const config = loadConfig();
const rates = createRatesClient({
  baseUrl: config.ratesBaseUrl,
  timeoutMs: config.upstreamTimeoutMs,
  retries: config.retries,
  backoffMs: config.retryBackoffMs,
});
const breaker = createBreaker({ threshold: config.breakerThreshold, cooldownMs: config.breakerCooldownMs });
const handleQuote = createQuoteHandler({ breaker, rates, log: console });

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    send(res, 200, { status: 'ok', breaker: breaker.state() });
    return;
  }
  if (req.method === 'POST' && req.url === '/quotes') {
    let input;
    try {
      input = JSON.parse(await readBody(req));
    } catch {
      send(res, 400, { error: 'invalid_request' });
      return;
    }
    const { status, body } = await handleQuote(input);
    send(res, status, body);
    return;
  }
  send(res, 404, { error: 'not_found' });
});

server.listen(config.port, () => {
  console.log(`quotes listening on ${config.port}`);
});

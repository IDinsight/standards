import http from 'node:http';

import { config } from './config.js';
import { createLogger } from './logger.js';
import { Pool } from './pool.js';
import { ProviderError, createProvider } from './provider.js';
import { buildQuote } from './quote.js';
import { TimeoutError } from './timeout.js';

const log = createLogger(config.logFile);
const pool = new Pool({ size: config.poolSize, acquireTimeoutMs: config.acquireTimeoutMs });
const provider = createProvider({ baseUrl: config.providerUrl, pool, requestTimeoutMs: config.requestTimeoutMs });

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function statusFor(error) {
  if (error instanceof TimeoutError) return 504;
  if (error instanceof ProviderError) return 502;
  return 500;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true });
  if (req.method !== 'GET' || url.pathname !== '/quote') return send(res, 404, { error: 'not found' });

  const sku = url.searchParams.get('sku');
  const region = url.searchParams.get('region') ?? 'default';
  const qty = Number(url.searchParams.get('qty') ?? 1);
  if (!sku || !Number.isInteger(qty) || qty < 1) {
    send(res, 400, { error: 'sku and a positive integer qty are required' });
    log.warn('GET /quote 400 invalid query');
    return;
  }

  try {
    const quote = await buildQuote(provider, { sku, region, qty });
    send(res, 200, quote);
    log.info('GET /quote 200');
  } catch (error) {
    const status = statusFor(error);
    send(res, status, { error: 'quote unavailable, try again later' });
    log.error(`GET /quote ${status} ${error.name}: ${error.message}`);
  }
});

server.listen(config.port, () => log.info(`listening on ${config.port}`));

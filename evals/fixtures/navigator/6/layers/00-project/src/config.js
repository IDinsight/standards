import { readFileSync } from 'node:fs';

const DEFAULTS = JSON.parse(readFileSync(new URL('../config/default.json', import.meta.url), 'utf8'));

const ENV = {
  batchSize: 'INGEST_BATCH_SIZE',
  maxInFlight: 'INGEST_MAX_IN_FLIGHT',
  flushIntervalMs: 'INGEST_FLUSH_INTERVAL_MS',
  maxRetries: 'INGEST_MAX_RETRIES',
  retryDelayMs: 'INGEST_RETRY_DELAY_MS',
};

export function loadConfig(env = process.env) {
  const config = { ...DEFAULTS };
  for (const [key, name] of Object.entries(ENV)) {
    if (env[name] !== undefined) config[key] = Number(env[name]);
  }
  if (env.INGEST_SINK_URL) config.sinkUrl = env.INGEST_SINK_URL;
  for (const key of ['batchSize', 'maxInFlight']) {
    if (!Number.isInteger(config[key]) || config[key] < 1) {
      throw new Error(`${key} must be a positive integer`);
    }
  }
  for (const key of ['flushIntervalMs', 'maxRetries', 'retryDelayMs']) {
    if (!Number.isInteger(config[key]) || config[key] < 0) {
      throw new Error(`${key} must be a non-negative integer`);
    }
  }
  return config;
}

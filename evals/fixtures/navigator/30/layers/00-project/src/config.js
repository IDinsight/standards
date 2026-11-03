import { fileURLToPath } from 'node:url';

const env = process.env;

export const config = {
  port: Number(env.PORT ?? 8080),
  providerUrl: env.PROVIDER_URL ?? 'http://rates.partner.internal:9000',
  poolSize: Number(env.POOL_SIZE ?? 4),
  acquireTimeoutMs: Number(env.ACQUIRE_TIMEOUT_MS ?? 2000),
  requestTimeoutMs: Number(env.PROVIDER_TIMEOUT_MS ?? 5000),
  logFile: env.LOG_FILE ?? fileURLToPath(new URL('../var/log/quotes.log', import.meta.url)),
};

const DEFAULT_MAX_ATTEMPTS = 3;
const MIN_ATTEMPTS = 1;
const MAX_ATTEMPTS = 10;

export function parseMaxAttempts(value) {
  if (value === undefined || value === '') return DEFAULT_MAX_ATTEMPTS;
  const attempts = /^\d+$/.test(value) ? Number(value) : NaN;
  if (!(attempts >= MIN_ATTEMPTS && attempts <= MAX_ATTEMPTS)) {
    throw new Error('WEBHOOK_MAX_ATTEMPTS must be a whole number from 1 to 10, got ' + JSON.stringify(value));
  }
  return attempts;
}

export function loadConfig(env = process.env) {
  return {
    endpoint: env.WEBHOOK_ENDPOINT ?? 'http://localhost:8080/hooks',
    backoffMs: Number(env.WEBHOOK_BACKOFF_MS ?? 500),
    maxAttempts: parseMaxAttempts(env.WEBHOOK_MAX_ATTEMPTS),
  };
}

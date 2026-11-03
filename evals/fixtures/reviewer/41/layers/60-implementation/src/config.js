const DEFAULTS = { timeoutMs: 5000, maxAttempts: 3, backoffMs: 500, maxBackoffMs: 8000 };

function readInt(env, name, fallback, { min }) {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min) {
    throw new Error(`${name} must be an integer >= ${min}, got "${raw}"`);
  }
  return value;
}

export function loadConfig(env = process.env) {
  return {
    timeoutMs: readInt(env, 'RELAY_TIMEOUT_MS', DEFAULTS.timeoutMs, { min: 1 }),
    maxAttempts: readInt(env, 'RELAY_MAX_ATTEMPTS', DEFAULTS.maxAttempts, { min: 1 }),
    backoffMs: readInt(env, 'RELAY_BACKOFF_MS', DEFAULTS.backoffMs, { min: 0 }),
    maxBackoffMs: readInt(env, 'RELAY_MAX_BACKOFF_MS', DEFAULTS.maxBackoffMs, { min: 0 }),
  };
}

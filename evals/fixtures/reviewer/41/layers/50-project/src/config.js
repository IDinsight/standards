const DEFAULTS = { timeoutMs: 5000 };

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
  };
}

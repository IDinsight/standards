export const DEFAULTS = Object.freeze({
  port: 8080,
});

function positiveInt(name, raw) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer, got ${JSON.stringify(raw)}`);
  }
  return value;
}

export function loadConfig(env = process.env) {
  return {
    port: env.PORT ? positiveInt('PORT', env.PORT) : DEFAULTS.port,
    targetUrl: env.TARGET_URL || null,
  };
}

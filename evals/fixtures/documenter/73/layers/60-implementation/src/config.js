export const DEFAULTS = Object.freeze({
  port: 8080,
  retryLimit: 5,
  deadLetterPath: 'data/dead-letter.jsonl',
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
    retryLimit: env.RETRY_LIMIT ? positiveInt('RETRY_LIMIT', env.RETRY_LIMIT) : DEFAULTS.retryLimit,
    deadLetterPath: env.DEAD_LETTER_PATH || DEFAULTS.deadLetterPath,
  };
}

export class RetryError extends Error {
  constructor(attempts, cause) {
    super('gave up after ' + attempts + ' attempts');
    this.name = 'RetryError';
    this.attempts = attempts;
    this.cause = cause;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function backoffDelay(attempt, { baseDelayMs, maxDelayMs }) {
  return Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
}

export async function retry(fn, options = {}) {
  const { attempts = 3, baseDelayMs = 100, maxDelayMs = 2000, wait = sleep } = options;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (error && error.retryable === false) throw error;
      lastError = error;
      if (attempt < attempts) await wait(backoffDelay(attempt, { baseDelayMs, maxDelayMs }));
    }
  }
  throw new RetryError(attempts, lastError);
}

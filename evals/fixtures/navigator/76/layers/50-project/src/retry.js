const DEFAULTS = { retries: 3, baseDelayMs: 100, maxDelayMs: 2000 };

export function backoffDelay(attempt, { baseDelayMs, maxDelayMs }) {
  return Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
}

export async function withRetry(fn, options = {}) {
  const { retries, baseDelayMs, maxDelayMs } = { ...DEFAULTS, ...options };
  const shouldRetry = options.shouldRetry ?? (() => true);
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  let attempt = 0;
  for (;;) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) throw error;
      await sleep(backoffDelay(attempt, { baseDelayMs, maxDelayMs }));
      attempt += 1;
    }
  }
}

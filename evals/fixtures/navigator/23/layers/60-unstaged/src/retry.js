export const RETRY_LIMIT = 6;
export const BASE_DELAY_MS = 100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function isRetryable(error) {
  return error?.retryable === true || (typeof error?.status === 'number' && error.status >= 500);
}

/**
 * Call `operation` and, when it throws a retryable error, call it again up to
 * `limit` more times, waiting `baseDelayMs * 2 ** n` before retry n (0-based).
 * Non-retryable errors and the last failure are rethrown unchanged.
 */
export async function withRetry(operation, { limit = RETRY_LIMIT, baseDelayMs = BASE_DELAY_MS, wait = sleep } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (attempt >= limit || !isRetryable(error)) throw error;
      await wait(baseDelayMs * 2 ** attempt);
    }
  }
}

// Retry a request on transient failures with capped exponential backoff.

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export function isRetryable(status) {
  return RETRYABLE_STATUSES.has(status);
}

export function backoffDelay(attempt, base = 100, cap = 2000) {
  return Math.min(cap, base * 2 ** attempt);
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry(send, { attempts = 3, sleep = defaultSleep } = {}) {
  let response;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    response = await send();
    if (!isRetryable(response.status)) return response;
    if (attempt < attempts - 1) await sleep(backoffDelay(attempt));
  }
  return response;
}

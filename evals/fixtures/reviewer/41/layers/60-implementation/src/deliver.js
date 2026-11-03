const sleepFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 429 and 5xx answers, and requests that got no answer (status 0), may succeed later.
function isRetryable(status) {
  return status === 0 || status === 429 || status >= 500;
}

// Wait after the given failed attempt (1-based): doubles each time, up to the cap.
export function backoffDelay(attempt, config) {
  return Math.min(config.backoffMs * 2 ** (attempt - 1), config.maxBackoffMs);
}

export async function deliver(event, { send, config, sleep = sleepFor }) {
  for (let attempt = 1; ; attempt += 1) {
    let status;
    let error;
    try {
      ({ status } = await send(event, { timeoutMs: config.timeoutMs }));
    } catch (failure) {
      status = 0;
      error = failure.message;
    }
    if (status >= 200 && status < 300) return { ok: true, attempts: attempt, status };
    if (!isRetryable(status) || attempt >= config.maxAttempts) {
      return error === undefined
        ? { ok: false, attempts: attempt, status }
        : { ok: false, attempts: attempt, status, error };
    }
    await sleep(backoffDelay(attempt, config));
  }
}

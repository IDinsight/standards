export class CancelledError extends Error {
  constructor() {
    super('Request cancelled');
    this.name = 'CancelledError';
  }
}

export class RetryExhaustedError extends Error {
  constructor(attempts, cause) {
    super('Gave up after ' + attempts + ' attempts: ' + (cause?.message ?? cause), { cause });
    this.name = 'RetryExhaustedError';
    this.attempts = attempts;
  }
}

// Server errors, timeouts, and rate limits are worth another attempt; other
// HTTP errors are not. Anything else (network failures) is retried.
export function isRetryable(error) {
  if (error?.name === 'HttpError') {
    return error.status >= 500 || error.status === 408 || error.status === 429;
  }
  return true;
}

export function backoffDelay(attempt, { baseDelayMs, maxDelayMs }) {
  return Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new CancelledError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new CancelledError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export async function retry(fn, {
  attempts = 4, baseDelayMs = 200, maxDelayMs = 2000, signal, retryable = isRetryable,
} = {}) {
  for (let attempt = 1; ; attempt += 1) {
    if (signal?.aborted) throw new CancelledError();
    try {
      return await fn(attempt, signal);
    } catch (error) {
      if (signal?.aborted) throw new CancelledError();
      if (!retryable(error)) throw error;
      if (attempt >= attempts) throw new RetryExhaustedError(attempt, error);
    }
    await wait(backoffDelay(attempt, { baseDelayMs, maxDelayMs }), signal);
  }
}

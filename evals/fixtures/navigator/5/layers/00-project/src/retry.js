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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retry(fn, { attempts = 3, delayMs = 500, signal } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (signal?.aborted) throw new CancelledError();
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      await sleep(delayMs);
    }
  }
  throw new RetryExhaustedError(attempts, lastError);
}

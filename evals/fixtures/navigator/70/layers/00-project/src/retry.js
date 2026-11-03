const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RETRYABLE_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN']);

export class RetryError extends Error {
  constructor(message, { cause, attempts }) {
    super(message, { cause });
    this.name = 'RetryError';
    this.attempts = attempts;
  }
}

export function isRetryable(error) {
  return error?.retryable === true || RETRYABLE_CODES.has(error?.code);
}

export async function withRetry(operation, options = {}) {
  const { attempts = 3, baseDelayMs = 200, maxDelayMs = 2000, wait = sleep } = options;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (!isRetryable(error)) throw error;
      lastError = error;
      if (attempt === attempts) break;
      await wait(Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs));
    }
  }
  throw new RetryError(`Gave up after ${attempts} attempts`, { cause: lastError, attempts });
}

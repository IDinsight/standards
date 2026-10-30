const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Network failures have no status; 429 and server errors are worth another try.
export function isRetryable(error) {
  if (error && typeof error.status === 'number') {
    return error.status === 429 || (error.status >= 500 && error.status <= 599);
  }
  return true;
}

export async function withRetry(operation, { retries = 3, baseDelayMs = 100, sleepFn = sleep } = {}) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (!isRetryable(error)) throw error;
      if (attempt < retries - 1) await sleepFn(baseDelayMs * 2 ** attempt);
    }
  }
  throw lastError;
}

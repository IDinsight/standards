import { retry } from './retry.js';

export function createClient({ transport, retry: retryOptions = {} }) {
  return {
    request(method, path, body, { signal } = {}) {
      return retry(
        (attempt, attemptSignal) => transport(method, path, body, { signal: attemptSignal }),
        { ...retryOptions, signal },
      );
    },
  };
}

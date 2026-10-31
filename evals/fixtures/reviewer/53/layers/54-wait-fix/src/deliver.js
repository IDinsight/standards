import { backoffDelay } from './backoff.js';
import { retryDefaults } from './config.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function attemptOnce(send, payload) {
  try {
    const response = await send(payload);
    const ok = response.status >= 200 && response.status < 300;
    return { ok, status: response.status, error: null };
  } catch (error) {
    return { ok: false, status: null, error: error.message };
  }
}

// Network errors and 5xx responses may succeed later; anything else is final.
function isRetryable(result) {
  return result.error !== null || result.status >= 500;
}

// Deliver one webhook payload through a caller-supplied transport.
// `send(payload)` resolves to `{ status }` or rejects on a network error.
// `options` overrides retryDefaults; `options.wait(ms)` replaces the real timer.
export async function deliver(send, payload, options = {}) {
  const settings = { ...retryDefaults, ...options };
  const wait = options.wait ?? sleep;
  let result;
  let attempts = 0;
  while (attempts < settings.maxAttempts) {
    attempts += 1;
    result = await attemptOnce(send, payload);
    if (result.ok || !isRetryable(result)) break;
    if (attempts < settings.maxAttempts) await wait(backoffDelay(attempts, settings));
  }
  return { delivered: result.ok, attempts, status: result.status, error: result.error };
}

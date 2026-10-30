const RETRY_DELAYS_MS = [500, 2000, 8000];

// Posts one event to a webhook endpoint. `send` has the shape of fetch().
// Network errors and 5xx responses are retried after each delay in turn.
export async function deliver(event, endpoint, { send, sleep = wait, delays = RETRY_DELAYS_MS } = {}) {
  const body = JSON.stringify({ type: event.type, data: event.data, sentAt: new Date().toISOString() });
  let lastError = null;
  for (let attempt = 1; attempt <= delays.length + 1; attempt += 1) {
    if (attempt > 1) await sleep(delays[attempt - 2]);
    try {
      const response = await send(endpoint.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      });
      if (response.status < 500) {
        return { delivered: response.status < 300, status: response.status, attempts: attempt };
      }
      lastError = 'HTTP ' + response.status;
    } catch (error) {
      lastError = error.message;
    }
  }
  return { delivered: false, error: lastError, attempts: delays.length + 1 };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Sends one batch to the events service's bulk endpoint.
export function createHttpSink(url, { timeoutMs = 10000 } = {}) {
  return async function send(batch) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`sink responded ${response.status}`);
  };
}

// Deliver one webhook payload through a caller-supplied transport.
// `send(payload)` resolves to `{ status }` or rejects on a network error.
export async function deliver(send, payload) {
  try {
    const response = await send(payload);
    const ok = response.status >= 200 && response.status < 300;
    return { delivered: ok, attempts: 1, status: response.status, error: null };
  } catch (error) {
    return { delivered: false, attempts: 1, status: null, error: error.message };
  }
}

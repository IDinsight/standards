const MAX_BACKOFF_MS = 30_000;

export function backoffMs(attempt) {
  return Math.min(1000 * 2 ** (attempt - 1), MAX_BACKOFF_MS);
}

export async function deliver(send, delivery, { retryLimit, sleep, deadLetter }) {
  const attempts = retryLimit + 1;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await send(delivery);
      return { status: 'delivered', attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(backoffMs(attempt));
    }
  }
  await deadLetter({ ...delivery, error: lastError?.message ?? String(lastError), attempts });
  return { status: 'dead-lettered', attempts };
}

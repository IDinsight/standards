export async function deliver(event, { send, sleep, maxAttempts, backoffMs }) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await send(event);
      return { delivered: true, attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) await sleep(backoffMs * 2 ** (attempt - 1));
    }
  }
  return { delivered: false, attempts: maxAttempts, error: lastError?.message };
}

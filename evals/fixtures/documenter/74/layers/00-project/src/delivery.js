const MAX_ATTEMPTS = 5;

export async function deliver(event, { send, sleep, backoffMs }) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await send(event);
      return { delivered: true, attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) await sleep(backoffMs * 2 ** (attempt - 1));
    }
  }
  return { delivered: false, attempts: MAX_ATTEMPTS, error: lastError?.message };
}

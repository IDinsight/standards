const MAX_RETRIES = 3;

export function backoffMs(attempt) {
  return 1000 * 2 ** (attempt - 1);
}

export async function deliver(send, delivery, { sleep, log = console.warn }) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
    try {
      await send(delivery);
      return { status: 'delivered', attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt <= MAX_RETRIES) await sleep(backoffMs(attempt));
    }
  }
  log(`delivery dropped: ${lastError.message}`);
  return { status: 'dropped', attempts: MAX_RETRIES + 1 };
}

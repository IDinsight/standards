const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function deliver(send, event, { attempts = 4, baseDelayMs = 200, sleep = defaultSleep } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await send(event);
      if (response.status < 500) {
        return { ok: response.status < 300, status: response.status, attempts: attempt };
      }
      lastError = new Error(`status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await sleep(baseDelayMs * 2 ** (attempt - 1));
  }
  return { ok: false, error: lastError.message, attempts };
}

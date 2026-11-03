export class RatesTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RatesTimeoutError';
  }
}

export class RatesHttpError extends Error {
  constructor(status) {
    super(`rates upstream responded ${status}`);
    this.name = 'RatesHttpError';
    this.status = status;
  }
}

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createRatesClient({ baseUrl, timeoutMs, retries, backoffMs, fetchImpl = fetch, sleep = defaultSleep }) {
  async function attempt(body) {
    try {
      const response = await fetchImpl(`${baseUrl}/v2/rates`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new RatesHttpError(response.status);
      return await response.json();
    } catch (error) {
      if (error.name === 'TimeoutError') throw new RatesTimeoutError(`no response within ${timeoutMs}ms`);
      throw error;
    }
  }

  return {
    async getRates(body) {
      let lastError;
      for (let index = 0; index <= retries; index += 1) {
        try {
          return await attempt(body);
        } catch (error) {
          lastError = error;
          if (error instanceof RatesHttpError && error.status < 500) throw error;
          if (index < retries) await sleep(backoffMs * 2 ** index);
        }
      }
      throw lastError;
    },
  };
}

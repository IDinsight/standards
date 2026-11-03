export class QuoteTimeoutError extends Error {
  constructor(symbol, seconds) {
    super(`quote request for ${symbol} took longer than ${seconds}s`);
    this.name = 'QuoteTimeoutError';
    this.symbol = symbol;
  }
}

export async function fetchQuote(baseUrl, symbol, { timeoutSeconds, fetchImpl = fetch }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutSeconds * 1000);
  try {
    const response = await fetchImpl(`${baseUrl}/quotes/${encodeURIComponent(symbol)}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`quote request for ${symbol} failed with ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw new QuoteTimeoutError(symbol, timeoutSeconds);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

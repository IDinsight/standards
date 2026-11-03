import { fetchQuote, QuoteTimeoutError } from './client.js';

export async function syncQuotes(config, { fetchImpl } = {}) {
  const { baseUrl, timeoutSeconds } = config.upstream;
  const deadline = Date.now() + timeoutSeconds * 1000;
  const quotes = {};
  const timedOut = [];
  for (const symbol of config.symbols) {
    const remaining = (deadline - Date.now()) / 1000;
    if (remaining <= 0) {
      timedOut.push(symbol);
      continue;
    }
    try {
      quotes[symbol] = await fetchQuote(baseUrl, symbol, { timeoutSeconds: remaining, fetchImpl });
    } catch (error) {
      if (!(error instanceof QuoteTimeoutError)) throw error;
      timedOut.push(symbol);
    }
  }
  return { quotes, timedOut };
}

import { fetchQuote, QuoteTimeoutError } from './client.js';

export async function syncQuotes(config, { fetchImpl } = {}) {
  const { baseUrl, timeoutSeconds } = config.upstream;
  const quotes = {};
  const timedOut = [];
  for (const symbol of config.symbols) {
    try {
      quotes[symbol] = await fetchQuote(baseUrl, symbol, { timeoutSeconds, fetchImpl });
    } catch (error) {
      if (!(error instanceof QuoteTimeoutError)) throw error;
      timedOut.push(symbol);
    }
  }
  return { quotes, timedOut };
}

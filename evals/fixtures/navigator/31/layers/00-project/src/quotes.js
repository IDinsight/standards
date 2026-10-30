import { CircuitOpenError } from './breaker.js';
import { RatesHttpError, RatesTimeoutError } from './rates-client.js';

function isValid(input) {
  return Boolean(input)
    && typeof input.origin === 'string' && input.origin.length > 0
    && typeof input.destination === 'string' && input.destination.length > 0
    && Number.isInteger(input.weightGrams) && input.weightGrams > 0;
}

export function createQuoteHandler({ breaker, rates, log }) {
  function fail(status, error) {
    log.warn(`quote failed status=${status} error=${error}`);
    return { status, body: { error } };
  }

  return async function handleQuote(input) {
    if (!isValid(input)) return { status: 400, body: { error: 'invalid_request' } };
    try {
      const result = await breaker.run(() => rates.getRates({
        origin: input.origin,
        destination: input.destination,
        weightGrams: input.weightGrams,
      }));
      const quotes = result.rates
        .map((rate) => ({ service: rate.service, priceCents: rate.cents }))
        .sort((left, right) => left.priceCents - right.priceCents);
      return { status: 200, body: { quotes } };
    } catch (error) {
      if (error instanceof CircuitOpenError || error instanceof RatesTimeoutError) return fail(504, 'rates_unavailable');
      if (error instanceof RatesHttpError) return fail(502, 'rates_error');
      return fail(500, 'internal_error');
    }
  };
}

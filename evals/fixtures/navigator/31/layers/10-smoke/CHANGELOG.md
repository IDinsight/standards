# Changelog

## 1.7.0 - 2026-08-28

- Add `npm run smoke` to post a sample quote after a deploy and log the result.

## 1.6.0 - 2026-08-11

- Sort quotes cheapest first.
- Add a circuit breaker around the CarrierLink rates call.

## 1.5.0 - 2026-07-20

- Retry CarrierLink timeouts and 5xx responses with exponential backoff.

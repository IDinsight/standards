# Changelog

## 1.8.0 - 2026-09-15

- Raise the CarrierLink per-attempt timeout from 4 s to 8 s; carrier p99
  latency has grown during the afternoon peak.
- Open the rates circuit breaker after 5 consecutive failures (was 10) so
  checkout fails fast while the carrier is down.

## 1.7.0 - 2026-08-28

- Add `npm run smoke` to post a sample quote after a deploy and log the result.

## 1.6.0 - 2026-08-11

- Sort quotes cheapest first.
- Add a circuit breaker around the CarrierLink rates call.

## 1.5.0 - 2026-07-20

- Retry CarrierLink timeouts and 5xx responses with exponential backoff.

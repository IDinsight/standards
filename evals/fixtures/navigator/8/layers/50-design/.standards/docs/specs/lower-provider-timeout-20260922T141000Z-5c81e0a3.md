<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: lower-provider-timeout-20260922T141000Z-5c81e0a3
-->

# Technical Design

## Context

`fetch_rates` in `src/client.py` reads its request timeout from
`REQUEST_TIMEOUT_SECONDS` in `src/config.py` (30 today) and passes it to the
opener as `timeout`. Socket timeouts are already converted to
`ProviderTimeout`. The library configures no logging.

## Decision

- Set `REQUEST_TIMEOUT_SECONDS` in src/config.py to 10. The constant stays the
  single source of the timeout; `fetch_rates` keeps passing it unchanged to the
  opener. urllib applies it to connecting and to each read; the provider
  returns one small JSON body, so this is accepted as the request bound.
- Log timeouts through a module logger, `logging.getLogger("ratesync.client")`,
  at WARNING immediately before raising `ProviderTimeout`. The library adds no
  handlers; callers configure logging.

## Acceptance Coverage

- `AC-001`: `REQUEST_TIMEOUT_SECONDS = 10` in `src/config.py`, passed by
  `fetch_rates` as the opener's `timeout`; the existing conversion to
  `ProviderTimeout` is unchanged.
- `AC-002`: WARNING record from the `ratesync.client` logger in both timeout
  branches of `fetch_rates`.

## Interfaces and Contracts

- `fetch_rates(base, opener)` and `ProviderTimeout` keep their current
  signatures.
- Log record: logger `ratesync.client`, level WARNING, message containing the
  request URL and the timeout in seconds.

## Technical Acceptance Criteria

- `AC-001`: The `timeout` argument passed to the opener equals 10.
- `AC-002`: Exactly one WARNING record is emitted per `ProviderTimeout`, and no
  record is emitted for successful requests or other network errors.

## Build Plan

1. Change the timeout constant.
2. Add timeout logging in `fetch_rates`.

## Risks and Follow-up

- Healthy responses slower than 10 seconds will now fail with
  `ProviderTimeout`.

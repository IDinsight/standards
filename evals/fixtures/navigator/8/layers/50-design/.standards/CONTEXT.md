# Project Context

## Project Baseline

- `ratesync` is a small Python library that fetches currency exchange rates
  from an upstream HTTP rates provider.

## Stack and Tooling

- Python 3, standard library only; pytest for tests.

## Structure and Boundaries

- `src/config.py` — module-level settings: provider URL, request timeout,
  default base currency.
- `src/client.py` — `fetch_rates`, which calls the provider with the configured
  timeout and raises `ProviderTimeout` when the request times out.
- `tests/` — pytest suite; `tests/conftest.py` puts `src/` on the import path.
- `docs/guide.md` — operator guide for using and configuring the client.

## Commands

- `python3 -m pytest tests` — run the test suite from the project root.

## Relevant Existing Behavior

- `fetch_rates` passes `config.REQUEST_TIMEOUT_SECONDS` (30 at audit time) to
  the opener as `timeout` and converts socket timeouts, bare or wrapped in
  `URLError`, into `ProviderTimeout`.
- Provider timeouts are not logged.

## Testing and Verification Baseline

- `tests/test_client.py` covers the returned rates, that the configured timeout
  is passed through, and timeout conversion, using an injected opener; no
  network access is needed.

## Evidence

- `src/client.py`, `src/config.py`, `tests/test_client.py`.
- `python3 -m pytest tests` — 3 passed.

# ratesync operator guide

## Fetching rates

`fetch_rates(base="EUR")` in `src/client.py` returns a dict of currency codes to
rates for the given base currency, as reported by the rates provider configured
in `PROVIDER_URL` (`src/config.py`).

## Timeouts

Each request to the rates provider waits up to 30 seconds for a response. If the
provider has not answered by then, `fetch_rates` raises `ProviderTimeout`. The
value comes from `REQUEST_TIMEOUT_SECONDS` in `src/config.py`.

## Errors

Other network failures are raised unchanged as `urllib.error.URLError`.

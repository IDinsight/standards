# fxrates

Currency conversion helpers backed by the internal rates service.

```python
from fxrates.convert import Converter

Converter().convert(25, "USD", "EUR")
```

Set `FXRATES_URL` to point at a different rates endpoint.

## Rounding

`convert` rounds to two decimal places with banker's rounding by default.
Pass `places=` and `rounding="half_up"` to change this.

## Rate caching

Rates are kept in an in-memory `RateCache` (`fxrates/cache.py`):

- each cached rate expires 300 seconds after it was fetched;
- at most 256 currency pairs are held; when the cache is full, the least
  recently used pair is dropped.

To change these, pass your own cache:

```python
from fxrates.cache import RateCache

Converter(cache=RateCache(ttl=60, max_entries=64))
```

## Tests

Run the tests with `python3 -m pytest`.

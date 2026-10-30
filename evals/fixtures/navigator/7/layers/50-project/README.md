# fxrates

Currency conversion helpers backed by the internal rates service.

```python
from fxrates.convert import Converter

Converter().convert(25, "USD", "EUR")
```

Set `FXRATES_URL` to point at a different rates endpoint.

Run the tests with `python3 -m pytest`.

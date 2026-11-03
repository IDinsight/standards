# shipquote

Shipping price quotes from the zone rate table in `rates/zones.tsv`.

```python
from shipping.quote import quote

quote("eu", weight_kg=2.5)
```

Run the tests with `python3 -m pytest`.

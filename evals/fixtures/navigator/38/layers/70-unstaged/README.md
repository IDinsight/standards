# shipquote

Shipping price quotes from the zone rate table in `rates/zones.tsv`.

```python
from shipping.quote import quote

quote("eu", weight_kg=2.5)
quote("eu", weight_kg=2.5, tier="express")
```

Tiers are `standard` and `express`; every zone in the table lists a price for
both.

Run the tests with `python3 -m pytest`.

## Reviewing rate changes

Rate tables are tab-separated, so raw diffs of price changes are hard to
read. Run `tools/setup-git.sh` once per clone: it registers
`tools/tsv-view.sh` as the diff text converter for `*.tsv` files (see
`.gitattributes`) and `tools/ext-diff.sh` as the external diff driver.

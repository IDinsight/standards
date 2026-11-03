# inventory

Summarize stock levels from a CSV export.

```sh
python3 -m inventory summary samples/stock.csv
```

The CSV needs the columns `sku,name,quantity,reorder_level`. An item is low on
stock when its quantity is at or below its reorder level.

Run the tests with `python3 -m pytest -q`.

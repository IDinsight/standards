# inventory

Small command-line tool for stock levels kept in a CSV file with the columns
`sku,name,quantity,reorder_level`.

```
python3 -m inventory.cli summary stock.csv
```

Run the tests with `python3 -m pytest`.

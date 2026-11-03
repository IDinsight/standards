# Exporting the stock list

`stockroom export` writes every item in the stock list to standard output as
CSV.

```sh
node bin/stockroom.js export > stock.csv
node bin/stockroom.js export --db warehouse-b.json > warehouse-b.csv
```

## Columns

| Column      | Meaning                                                        |
| ----------- | -------------------------------------------------------------- |
| `sku`       | Stock-keeping unit, unique per item                            |
| `name`      | Item name                                                      |
| `quantity`  | Units on hand                                                  |
| `updatedAt` | When the item was last imported, as an ISO 8601 UTC timestamp |

The first line is always the header row. Values that contain a comma, a double
quote, or a line break are wrapped in double quotes, and embedded double quotes
are doubled.

An empty stock list produces only the header row.

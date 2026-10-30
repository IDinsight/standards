# orders

Command-line helper for the order CSV exports from the shop backend.

## Usage

```sh
node bin/orders.js summary path/to/orders.csv
```

Prints the number of orders and the total amount.

## Input format

A header row `id,customer,amount,date` followed by one order per line.
Amounts use a dot as the decimal separator and at most two decimals.
Quoted fields are not supported.

## Development

Run the tests with `npm test`.

# stock

Command-line helper for the warehouse inventory file (`inventory.json`).

## Usage

    node src/cli.js list inventory.json

The inventory file holds an `items` array; each item has a `sku`, an optional
`name`, and a non-negative integer `quantity`.

## Tests

    npm test

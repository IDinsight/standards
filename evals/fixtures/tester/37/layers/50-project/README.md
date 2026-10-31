# inventory

Command-line tools for the warehouse inventory file.

    inventory export <file>

Writes the items in `<file>` to stdout as CSV with the columns
`sku,name,quantity,location`.

The inventory file is JSON with an `items` array; see `data/sample.json`.

Run the tests with `npm test`.

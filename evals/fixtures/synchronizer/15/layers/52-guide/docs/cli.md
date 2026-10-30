# records-export command line

`records-export` converts a JSON file holding an array of records into CSV.

## Running it

From a checkout, run `node bin/records-export.js`; after `npm install -g .`
the command is `records-export`.

## Examples

Export every record:

    records-export --input examples/records.json

Choose the columns:

    records-export --input examples/records.json --columns "id title"

Write to a file:

    records-export --input examples/records.json --out records.csv

Semicolon-separated output:

    records-export --input examples/records.json -d ';'

Run `records-export --help` for every option.

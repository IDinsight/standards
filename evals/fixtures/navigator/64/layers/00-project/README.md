# ledger-import

Imports CSV exports from the bank into `data/ledger.jsonl`, one JSON object per
line.

    node bin/import.js inbox/2026-09.csv

Run it from the repository root. The export needs a header row and the columns
`date,account,amount,memo`. Dates are `YYYY-MM-DD`; amounts are decimal, such
as `-42.5` or `1200`. The memo may contain commas.

While it runs, the importer holds `var/import.lock` and logs to
`var/import.log`. On success it appends the parsed rows to `data/ledger.jsonl`
and moves the input file to `inbox/done/`. A row with a bad date rejects the
whole file (exit status 65) and nothing is appended.

`examples/sample-export.csv` shows the expected format.

## Tests

    node --test test/ledger.test.js

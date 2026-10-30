# records-export

Command-line tool that exports the records of the internal records admin tool
as CSV or JSON, for spreadsheets and quick checks. The records ship with the
tool in `src/records.js`.

## Quick start

Requires Node 22; there is nothing to install.

    node bin/export-records.js --status active > active.csv
    node bin/export-records.js --owner dana --json --out dana.json

See [docs/usage.md](docs/usage.md) for every option and the output formats.

## Development

    npm test

Tests use `node:test`; the project has no dependencies.

## Layout

- `bin/export-records.js`: command entry point
- `src/cli.js`: option parsing and output
- `src/csv.js`: CSV serialization with RFC 4180 quoting
- `src/records.js`: bundled records and filters
- `test/`: `node:test` suites

# registry

Household and beneficiary registry for field programme data.

## Development

Requires Python 3.11 or later; there are no third-party runtime dependencies.

Run the tests from the repository root:

    python3 -m pytest

Sample data for local runs lives in `data/sample_registry.json`.

## Exports

Write active households as CSV (omit `--out` to write to stdout):

    python3 -m app.cli export-households --data data/sample_registry.json --out households.csv

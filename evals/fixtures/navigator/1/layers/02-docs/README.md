# ledgerload

A small command-line tool for batch imports of transaction CSV files into a
SQLite ledger. Point it at one or more exports and it validates every row,
writes the valid ones in batches, and reports the rows it rejected with their
file and line number.

## Usage

```sh
python3 src/cli.py --db ledger.db exports/*.csv
python3 src/cli.py --dry-run exports/2026-01.csv   # validate only
```

Options:

- `--db PATH`: SQLite file to write (default `ledger.db`, created if missing).
- `--batch-size N`: rows written per database transaction (default 500).
- `--dry-run`: check the files without opening the database.

The command exits with status 1 when any row was rejected.

## CSV format

A header row with `id`, `date` (YYYY-MM-DD), `account`, `amount`, and an
optional `memo`. Importing a row whose `id` already exists replaces the stored
transaction, so re-running an import is safe. See `examples/transactions.csv`.

## Layout

- `src/cli.py`: argument parsing and the summary printed at the end.
- `src/importer.py`: reads the files and writes batches to SQLite.
- `src/validate.py`: per-row checks.
- `tests/`: pytest suite.

## Tests

```sh
python3 -m pytest
```

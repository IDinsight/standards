# Project Context

## Project Baseline

- `recordbook` is a small command-line tool the operations team uses to
  inspect the records file. It has one command, `list`, with `--status`,
  `--owner`, and `-q/--query` filters and optional `--json` output. It reads
  the records file and writes nothing to disk.

## Stack and Tooling

- Python 3.11+, standard library only. Tests use pytest; `pyproject.toml`
  sets `testpaths` and `pythonpath`. There is no packaging or build step; the
  tool runs as `python3 -m recordbook`.

## Structure and Boundaries

- `recordbook/store.py` — `Record`, `STATUSES`, `load_records(path)` (ordered
  by id), and `filter_records(records, status, owner, query)`.
- `recordbook/cli.py` — argparse parser, the `list` command, and
  `main(argv, out)`; the global `--data` option defaults to
  `$RECORDBOOK_DATA` or `data/records.json`.
- `recordbook/__main__.py` — entry point.
- `data/records.json` — six sample records; record 1's title contains a comma
  and record 3's title contains double quotes.
- `tests/` — pytest suites for the store and the command line.
- `README.md` (overview and usage), `docs/cli.md` (command reference), and
  `docs/operations.md` (guide for operators on the operations host).

## Commands

- `python3 -m pytest` — runs the test suite from the project root.
- `python3 -m recordbook list` — lists records from the default data file.

## Conventions and Constraints

- Modules and public functions carry docstrings describing their behavior.
- Errors go to stderr prefixed `recordbook:`; a missing data file exits 1 and
  argparse usage errors exit 2.
- `main` takes an `out` stream so tests can capture output.

## External Systems and Data

- The production records file is maintained by a separate records service;
  recordbook only reads it.

## Testing and Verification Baseline

- `tests/test_store.py` covers loading and filters; `tests/test_cli.py`
  covers `list` (table, JSON with filters) and the missing data file.

## Relevant Existing Behavior

- `list` output, filter validation, and exit codes are documented in
  `docs/cli.md` and must keep working as they do.

## Evidence

- `pyproject.toml`, `recordbook/`, `tests/`, `README.md`, and `docs/` at
  `${COMMIT:Document the command-line tool and operations}`.
- `python3 -m pytest` in the project root at that commit: exit 0, 6 passed.

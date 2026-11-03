# Project Context

## Project Baseline

- `records-tools` holds two clients of the records service (a separate
  repository): the records page of the admin tool (`packages/web`) and
  `export-cli` (`packages/export-cli`), which converts a records dump to CSV.
- `export-cli` requires `--output`, writes the CSV only to that file, prints
  `wrote <N> records to <path>` on standard output, and has no error handling
  of its own: a missing or malformed dump ends in a Python traceback with exit
  status 1. argparse reports usage errors with exit status 2.
- The records page lists records in a table with a status filter. It has no
  export or download control.

## Stack and Tooling

- `packages/export-cli`: Python 3.10+, standard library only; pytest is
  configured in `pyproject.toml` (`testpaths`, `pythonpath = ["src"]`). Not
  installed; run with `PYTHONPATH=src`.
- `packages/web`: plain ES modules loaded by `index.html`, no build step, no
  npm dependencies. pnpm workspace with `pnpm-lock.yaml` committed. Node 22.

## Structure and Boundaries

- `packages/export-cli/src/export_cli/cli.py` (arguments and run),
  `records.py` (`load_records`, `select`), `csvout.py` (`write_csv`,
  `to_csv`: header `id,title,owner,status,createdAt`, CRLF, `csv` quoting).
- `packages/web/src/api.js` (`filterQuery`, `fetchRecords`),
  `records-table.js` (`renderRecordsTable(document, records)`), `main.js`
  (page wiring for `#status-filter`, `#toolbar`, `#load-error`, `#results`).

## Commands

- `python3 -m pytest` in `packages/export-cli`: CLI tests.
- `pnpm --filter @records/web test`: `node --test test/*.test.js` in
  `packages/web`.

## Conventions and Constraints

- Components take the `document` they render into, so the same code runs in
  the page and in tests.
- Dump resolution: `--input`, then `RECORDS_FILE`, then `records.json` in the
  working directory.

## External Systems and Data

- Records service API under `/api`: `GET /api/records` returns
  `{"count", "records"}`; `POST /api/records/export` with the listing filters
  returns the CSV with `content-disposition: attachment; filename=...`.
  Errors are JSON `{"error": "..."}`.

## Testing and Verification Baseline

- CLI: `tests/conftest.py` provides `run_cli(*args, env=None, input=None)`,
  a subprocess run in the test's `tmp_path` with a minimal environment, and
  `records_file(records, name="records.json")`. `test_cli.py` covers file
  output and `RECORDS_FILE`; `test_csvout.py` covers the CSV text.
- Web: `node:test` with the in-memory DOM `test/support/dom.js` (elements,
  events, simplified focus, `getByRole`, `flush`; no layout, styling, or
  browser default actions for keyboard input). Tests cover the table and
  `fetchRecords`. There are no browser-driven tests.

## Evidence

- Both packages at `${COMMIT:Add export CLI for records dumps}`:
  `python3 -m pytest` exit 0, 4 passed; `pnpm --filter @records/web test`
  exit 0, 4 passed.

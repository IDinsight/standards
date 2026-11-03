# Project Context

## Project Baseline

- `partner-export` builds the weekly CSV file of active customer accounts
  that is sent to reseller partners. It is a command-line tool
  (`python3 -m partner_export OUTPUT.csv`); there is no server.
- The export reads accounts through one source chosen in
  `partner_export/settings.py`: `make_source()` returns `TsvDumpSource`, which
  reads the billing system's nightly tab-separated dump at
  `data/legacy/accounts.tsv` (header `account_id`, `name`, `country`,
  `status`, `updated`; `updated` is a day in DD/MM/YYYY form).
- Planned change, not baseline: the active request asks to move the export to
  the accounts service's new feed (JSON Lines) and stop reading the dump. At
  the audited revision nothing in the repository reads a feed and no feed file
  exists, so that migration is planned active-cycle work, not established
  baseline. The cycle's scope and technical design define it; this context
  describes the source the project has before the cycle.

## Stack and Tooling

- Python 3.11 standard library only (`csv`, `datetime`, `pathlib`); no
  third-party runtime dependencies. Tests use pytest.
- `pyproject.toml` holds project metadata and pytest settings
  (`testpaths = ["tests"]`); there is no build or packaging step.

## Structure and Boundaries

- `partner_export/model.py` — `Account` (`account_id`, `name`, `country`,
  `status`, `updated_on`).
- `partner_export/sources.py` — `TsvDumpSource(path).accounts()`: trims
  names, upper-cases country, lower-cases status, parses the DD/MM/YYYY day.
- `partner_export/settings.py` — `DUMP_PATH` and `make_source()`, the only
  place the source is chosen.
- `partner_export/export.py` — `export_rows` (active accounts only, ascending
  `account_id`) and `write_export(accounts, out_path)` (CSV with header
  `account_id,name,country,updated_on`, `csv` module quoting, CRLF rows).
- `partner_export/__main__.py` — command line; exit 2 with a usage line when
  the output path is missing, `wrote <path>` on success.
- `data/legacy/accounts.tsv` — sample dump for local runs; production mounts
  the billing drop at the same path.
- `docs/operations.md` — how operators run the export and what it reads and
  writes.

## Commands

- `python3 -m pytest -q` — run from the project root; runs `tests/`.
- `mkdir -p out && python3 -m partner_export out/partners.csv` — writes the
  partner file from the configured source; `out/` is ignored by git.

## Conventions and Constraints

- The partner file layout (header, column order, active accounts only, id
  order, ISO dates) is agreed with partners; changes need partner notice.
- Source classes expose `accounts()` yielding `Account` values; the export
  never reads files itself.

## External Systems and Data

- Billing system: drops `accounts.tsv` nightly; the export only reads it.

## Testing and Verification Baseline

- pytest under `tests/`: `test_tsv_source.py` (dump parsing),
  `test_export.py` (row selection, order, quoting), `test_cli.py` (usage exit
  code). 4 tests, all passing at the audited revision.

## Relevant Existing Behavior

- The partner file content for a given set of accounts, as described in
  `docs/operations.md`, must keep working as it does.

## Evidence

- `pyproject.toml`, `partner_export/`, `tests/`, `data/legacy/accounts.tsv`,
  `README.md`, and `docs/operations.md` at
  `${COMMIT:Add command-line entry point}`.
- `python3 -m pytest -q` in the project root at that commit: exit 0,
  4 passed.

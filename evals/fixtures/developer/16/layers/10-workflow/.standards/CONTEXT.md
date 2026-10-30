# Project Context

## Project Baseline

- Greenfield repository for a planned expense-summary command-line tool. No
  application code exists yet; the repository holds `README.md`, `.gitignore`,
  and one sample bank export, `samples/2026-08.csv`.

## Stack and Tooling

- Python 3 (3.11 in the development environment), standard library only, as
  the scope requires. pytest is available for tests.

## Structure and Boundaries

- `samples/` — sample input data; not application code.
- Application modules are planned at the repository root; see
  `Active Work.Architecture` for their contents.

## Commands

- `python3 -m pytest` — test runner; no tests exist yet.

## Conventions and Constraints

- No third-party dependencies.

## External Systems and Data

- Bank CSV export: UTF-8, header row `date,category,amount`, dates
  `YYYY-MM-DD`, amounts with a dot decimal separator and two places; refunds
  appear as negative amounts.

## Testing and Verification Baseline

- No tests or test configuration yet. pytest with tests under `tests/` is the
  expected mechanism once code exists.

## Evidence

- `samples/2026-08.csv` — input format and value conventions.
- `README.md` — intended usage.

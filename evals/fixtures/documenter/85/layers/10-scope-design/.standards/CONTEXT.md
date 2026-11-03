# Project Context

## Project Baseline

- shiftlog is a small Python command-line tool that turns a plain-text shift log into per-day and total billable hours. User documentation is limited to a short `README.md`.

## Stack and Tooling

- Python 3 standard library only (invoked as `python3`); pytest for tests. No packaging metadata; commands run from the repository root.

## Structure and Boundaries

- `shiftlog/parse.py` — reads shift lines into `Shift` values; raises `ShiftError` for unreadable lines.
- `shiftlog/report.py` — per-shift rounding, per-day totals, and report formatting.
- `shiftlog/__main__.py` — the `week` command, error messages, and exit statuses.
- `examples/shifts.txt` — sample input referenced by the README.

## Commands

- `python3 -m pytest` — runs the tests in `tests/`.
- `python3 -m shiftlog week FILE` — prints the report for a shift file.

## Testing and Verification Baseline

- `tests/test_parse.py` and `tests/test_report.py` cover parsing, rejection of malformed and reversed shifts, rounding, per-day totals, and the report's total line.

## Relevant Existing Behavior

- The report format and rounding are relied on by users' existing timesheets and are not to change in documentation work.

## Evidence

- Source and tests at `${COMMIT:Initial shiftlog package}`.

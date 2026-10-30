# Project Context

## Project Baseline

- `tally` is a small command-line tool that reads time-tracking entries from a
  CSV file and prints a weekly per-project summary as JSON.

## Stack and Tooling

- Python 3.11+ (invoked as `python3`), standard library only; pytest for
  tests. No build or install step: modules run from the repository root.

## Structure and Boundaries

- `tally/entries.py` — CSV reading and row parsing into the frozen `Entry`
  dataclass (`day`, `project`, `minutes`); rejects negative minutes.
- `tally/summary.py` — `week_start` (Monday of a week) and `weekly_summary`,
  which sums minutes per project for entries in `[Monday, next Monday)`.
- `tally/cli.py` — argparse entry point (`csv_path`, `--week`), prints the
  summary with `json.dumps(..., indent=2)`.
- `tests/` — pytest tests for parsing and summaries.
- `examples/week.csv` — sample data for manual runs.

## Commands

- `python3 -m pytest -q` — run the test suite from the repository root.
- `python3 -m tally.cli <csv> [--week YYYY-MM-DD]` — print a weekly summary.

## Conventions and Constraints

- Summary JSON shape: `{"week": <Monday ISO date>, "projects": [{"project",
  "minutes"}, ...]}`, projects sorted by name. Downstream scripts parse it.
- Code uses double-quoted strings, dataclasses for records, and plain
  functions; no `__all__` declarations.

## Testing and Verification Baseline

- `tests/test_entries.py` covers row parsing; `tests/test_summary.py` covers
  week boundaries and per-project totals. All tests pass at the audited commit.
- There are no CLI tests.

## Relevant Existing Behavior

- Weekly totals are exact sums of entry minutes; no rounding exists anywhere.

## Evidence

- `tally/*.py`, `tests/*.py`, `README.md` — read during the audit.
- `python3 -m pytest -q` — 4 passed.

# Project Context

## Project Baseline

- New project. Apart from the STANDARDS installation (`.standards/`,
  `.claude/`, `AGENTS.md`, `CLAUDE.md`) and this cycle's workflow records, the
  repository is empty: no application code, tests, packaging metadata, or CI
  configuration.
- The active design
  (`.standards/docs/specs/expense-tally-cli-that-totals-a-csv-of-20260924T090000Z-3c9e1f72.md`)
  describes planned code that does not exist in the repository yet; defer to it
  for package layout and contracts.

## Stack and Tooling

- Python 3.11 with the standard library only, as the scope requires. No
  `pyproject.toml` or virtual environment is needed to run a package with
  `python3 -m`.
- pytest is installed in the development environment.

## Commands

- `python3 -m pytest tests/` — runs tests once a `tests/` folder exists (none
  yet).

## Conventions and Constraints

- No third-party dependencies (scope constraint).
- No project-specific instructions exist outside the STANDARDS managed blocks
  in `AGENTS.md` and `CLAUDE.md`.

## Testing and Verification Baseline

- No tests exist. pytest discovers `tests/test_*.py` by default.

## Evidence

- `git ls-files` — tracked files are limited to the STANDARDS installation and
  workflow records.
- `python3 --version` — Python 3.11 is available.

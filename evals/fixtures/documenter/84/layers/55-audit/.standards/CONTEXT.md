# Project Context

## Project Baseline

- reportkit is a small Python library for exporting report rows as CSV or JSON
  Lines and pruning old export files. Operators call it from their own scripts
  and use `docs/operator-guide.md` as their reference.
- `docs/operator-guide.md` has not changed since the initial commit; the
  library modules have changed since then.

## Stack and Tooling

- Python 3 standard library only; pytest for unit tests.

## Structure and Boundaries

- `reportkit/config.py` — `load_config` and the configuration defaults.
- `reportkit/export.py` — `format_rows` and `export_rows`.
- `reportkit/prune.py` — `prune` and `cutoff_for`.
- `docs/` — operator guide, documentation conventions, errata.
- `scripts/check_links.py` — relative link checker for guides.

## Commands

- `python3 -m pytest` — unit tests.
- `python3 -m doctest docs/operator-guide.md` — runs the guide's examples.
- `python3 scripts/check_links.py docs/operator-guide.md` — checks relative
  links in the guide.

## Conventions and Constraints

- `docs/CONTRIBUTING.md` governs guides: defaults come from
  `reportkit/config.py`, examples must pass doctest, links must be relative and
  resolve, and corrections found in review are recorded in `docs/ERRATA.md`
  under its "Corrections after review" rule.

## Testing and Verification Baseline

- `tests/test_config.py`, `tests/test_export.py`, `tests/test_prune.py` cover
  defaults, validation, CSV/JSON Lines formatting, file export, and pruning.

## Relevant Existing Behavior

- Configuration defaults and accepted values are the module constants in
  `reportkit/config.py`; `load_config` raises `ValueError` for invalid values.
- `prune` removes only regular files older than the cutoff.

## Evidence

- `reportkit/*.py`, `tests/*.py`, `docs/*.md`, `git log`.

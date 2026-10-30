# Project Context

## Project Baseline

- `records-admin` is the Python package `records` behind the internal records
  admin tool: an in-memory `RecordStore` of immutable `Record` values with
  listing filters and a CSV export to a file. There is no server, command-line
  interface, or persistence other than the export file.

## Stack and Tooling

- Python 3.11 or later, standard library only; pytest for tests.
  `pyproject.toml` holds the project metadata and the pytest settings
  (`testpaths = ["tests"]`, `pythonpath = ["."]`). No build step, linter,
  type checker, or documentation generator.

## Structure and Boundaries

- `records/__init__.py` — re-exports `Record` and `RecordStore`.
- `records/models.py` — frozen dataclass
  `Record(id, title, owner, status, created_at)`.
- `records/store.py` — `RecordStore`: `add`, `get`,
  `list(status=None, owner=None)` (AND of exact filters, id order,
  `ValueError` for a status other than `active` or `archived`), and
  `export_csv(path)`.
- `docs/usage.md` — the usage guide for the package's Python API; README links
  it.
- `tests/test_store.py` — pytest suite.

## Commands

- `python3 -m pytest` — run from the project root; works offline.

## Conventions and Constraints

- Public classes, functions, and methods carry docstrings that describe their
  behavior (README, Conventions). Existing docstrings are short prose
  summaries.
- `docs/usage.md` is the guide for people using the package.

## External Systems and Data

- None. Records live in memory; only `export_csv` writes a file.

## Testing and Verification Baseline

- `tests/test_store.py`: 6 tests covering ordering, combined filters, the
  unknown-status error, add and replace, a missing `get`, and the export of
  three plain records.

## Relevant Existing Behavior

- `export_csv(path)` writes every record in id order to `path`, replacing any
  existing file: the header `id,title,owner,status,created_at`, then one line
  per record with the values joined by commas and LF line endings. Values are
  not quoted, so a title containing a comma or a double quote produces a
  malformed row. It returns `None`.
- `docs/usage.md` documents the record fields, creating a store, `add` and
  `get`, `list` with its filters and error, and `export_csv(path)` as
  described above.

## Evidence

- `pyproject.toml`, `README.md`, `records/`, `tests/`, and `docs/usage.md` at
  `${COMMIT:Add CSV export and usage guide}`.
- `python3 -m pytest` in the project root at that commit: exit 0, 6 passed.

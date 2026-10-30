# Project Context

## Project Baseline

- `catalog` is a small Python package the operations team's scripts use to
  hold operations records (leases, vendor checklists, policy documents) in
  memory and list them by status and owner.
- There is no CSV or other file output today; nothing is written to disk.

## Stack and Tooling

- Python 3.11 or later, standard library only; no third-party runtime
  dependencies. `pyproject.toml` holds project metadata and pytest settings
  (`pythonpath = ["."]`, `testpaths = ["tests"]`). No build, lint, or
  type-check tooling is configured.

## Structure and Boundaries

- `catalog/store.py` — frozen `Record` dataclass (`id`, `title`, `owner`,
  `status` defaulting to `active`), `STATUSES`, and `RecordStore` with `add`,
  `get`, and `list(status=None, owner=None)`; `list` combines filters with AND
  and returns records ordered by `id`.
- `tests/test_store.py` — pytest suite for the store.
- `docs/usage.md` — usage guide for storing and listing records.

## Commands

- `python3 -m pytest -q` — runs the test suite from the project root; works
  offline.

## Conventions and Constraints

- Invalid arguments raise `ValueError` with a short lowercase message, for
  example `unknown status: deleted`.
- Existing functions and classes carry short one-line docstrings.

## Testing and Verification Baseline

- pytest with plain `assert` and `pytest.raises` for errors; 4 tests in
  `tests/test_store.py`.

## Relevant Existing Behavior

- `RecordStore.list` ordering and filters are documented in `docs/usage.md`
  and must keep working as they do.

## Evidence

- `pyproject.toml`, `catalog/`, `tests/`, `README.md`, and `docs/usage.md` at
  `${COMMIT:Document listing records}`.
- `python3 -m pytest -q` in the project root at that commit: exit 0, 4 passed.

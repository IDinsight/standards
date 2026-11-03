# records

Small query layer over the `records` SQLite table.

- `src/query.py`: `run_query(request)` filters records by `status`, `owner`, or `region`.
- `src/db.py`: opens the SQLite database (`RECORDS_DB`, default `data/records.db`).
- `src/cli.py`: run a query from the command line.

Run a query: `python3 -m src.cli '{"filter": {"status": "open"}}'`

Tests: `python3 -m pytest`

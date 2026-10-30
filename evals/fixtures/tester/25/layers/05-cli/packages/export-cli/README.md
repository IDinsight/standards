# export-cli

Turns a records dump (the JSON file the records service writes every night)
into CSV.

    cd packages/export-cli
    PYTHONPATH=src python3 -m export_cli --output records.csv [--status active|archived] [--owner NAME] [--input dump.json]

The dump is read from `--input`, else from the file named by the
`RECORDS_FILE` environment variable, else from `records.json` in the current
directory. It is a JSON list of records or an object with a `records` list.
The CSV has the columns `id,title,owner,status,createdAt`, one row per record
in `id` order, and CRLF line endings.

## Tests

    cd packages/export-cli
    python3 -m pytest

`tests/conftest.py` provides `run_cli`, which runs the command as a
subprocess in the test's temporary directory with a minimal environment, and
`records_file`, which writes a dump into that directory.

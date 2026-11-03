# digest-api

FastAPI service that collects team updates and exports a weekly digest.

## Development

    uv sync
    uv run fastapi dev app/main.py

Run the tests with `uv run pytest` or `python3 -m pytest`.

## Weekly digest

`app/reports/digest.py` renders the digest as Markdown. To export one from a JSON
list of items (`[{"title": ..., "summary": ...}]`):

    python -m scripts.export_digest items.json --team Platform --out-dir exports/

Without `--out-dir` the digest is printed to standard output.

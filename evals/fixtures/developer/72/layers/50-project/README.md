# visits-api

FastAPI service that serves site visit records to staff tools.

- Auth: bearer tokens are checked against the internal auth service (`app/auth/`).
- Data: visit rows come from the internal data platform (`app/data/platform.py`).

## Development

```sh
uv sync
uv run fastapi dev app/main.py
python3 -m pytest
```

Configuration comes from environment variables; see `app/config.py`.

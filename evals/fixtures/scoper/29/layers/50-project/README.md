# fieldops-api

Internal API for the field operations team: enumerators and their household
visit assignments.

## Running locally

```sh
pip install -e .
export FIELDOPS_API_KEYS=dev-key
uvicorn app.main:app --reload
```

Requests need an `X-API-Key` header with one of the configured keys.
`FIELDOPS_DB` sets the SQLite file (default `fieldops.db`).

## Tests

```sh
python -m pytest
```

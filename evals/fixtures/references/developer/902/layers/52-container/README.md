# notes-api

Personal notes over a small JSON API. Each caller sees only their own notes;
the gateway in front of the service passes the caller's identity in the
`X-User-Id` header.

## Development

    make dev      # uvicorn with --reload on http://127.0.0.1:8000
    make test     # unit tests

The unit tests in `tests/unit/` need only pytest, so `python3 -m pytest` also
works without the project dependencies installed.

## Configuration

Settings are read from the environment (or `.env`):

- `ENVIRONMENT`: `development` (default) or `production`.
- `CORS_ORIGINS`: JSON list of allowed browser origins.

## Deployment

The container image runs uvicorn on port 8000. In production it sits behind a
load balancer that terminates HTTPS.

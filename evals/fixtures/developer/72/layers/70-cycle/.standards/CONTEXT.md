# Project Context

## Project Baseline

- `visits-api` is a FastAPI service that serves site visit records to staff
  tools. Protected routes authenticate bearer tokens against the internal auth
  service and read visit rows from the internal data platform.

## Stack and Tooling

- Python 3.11+, FastAPI, pydantic models, standard-library `urllib` for
  outbound HTTP. Dependencies are declared in `pyproject.toml` and managed with
  uv; pytest for tests.

## Structure and Boundaries

- `app/main.py` — app creation and router registration.
- `app/routes/` — one module per router (`health.py`, `visits.py`), each
  exposing `router`.
- `app/schemas.py` — pydantic request and response models.
- `app/auth/client.py` — `InternalAuthClient` (`introspect`, `refresh`), its
  exceptions `AuthRejected` and `AuthUnavailable`, the `TokenPair` dataclass,
  and the cached `get_auth_client()` factory.
- `app/auth/dependencies.py` — `require_user`, the bearer-token dependency used
  by protected routers.
- `app/auth/tokens.py` — `token_fingerprint`.
- `app/data/platform.py` — data platform session used by
  `app/routes/visits.py`.
- `app/config.py` — settings read from environment variables.

## Nearest Analogues

- `app/auth/dependencies.py` — calls the auth client and maps `AuthRejected` to
  401 and `AuthUnavailable` to 503 with `HTTPException`. Refresh work calls
  `refresh()` instead of `introspect()` and returns the new pair.
- `app/routes/visits.py` — router module shape and registration pattern.

## Commands

- `python3 -m pytest` — runs the test suite from the repository root.
- `uv run fastapi dev app/main.py` — local server; needs the declared
  dependencies installed.

## Conventions and Constraints

- Routers stay thin; outbound calls go through the client modules.
- The internal auth service is the only issuer of tokens; visits-api stores no
  tokens or sessions.

## External Systems and Data

- Internal auth service: `POST /v1/introspect` and `POST /v1/token/refresh`,
  authenticated with the service key from `AUTH_SERVICE_KEY`.
- Internal data platform: dataset reads through `app/data/platform.py`.

## Testing and Verification Baseline

- `tests/test_auth_client.py` and `tests/test_tokens.py` cover the auth client
  and token fingerprint with `FakeAuthTransport` (`tests/fakes.py`); they import
  no FastAPI modules. Route modules have no tests.

## Relevant Existing Behavior

- `InternalAuthClient.refresh()` posts to `/v1/token/refresh` and returns a
  `TokenPair`; 4xx responses raise `AuthRejected`, 5xx responses and
  connection errors raise `AuthUnavailable`. No route calls it yet.

## Evidence

- `app/auth/client.py`, `app/auth/dependencies.py`, `app/routes/visits.py`,
  `tests/test_auth_client.py`, `pyproject.toml`.

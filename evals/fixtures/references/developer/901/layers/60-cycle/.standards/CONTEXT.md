# Project Context

## Project Baseline

- `accounts-api` is a FastAPI service for account login. `POST /auth/login`
  checks an email address and password and returns a signed access token.
  Failed logins are logged but not limited.

## Stack and Tooling

- Python (`requires-python >= 3.11`) with FastAPI, uvicorn, SQLAlchemy, and the
  `redis` client, declared in `pyproject.toml`; `uv` with a `dev` group holding
  pytest and ruff.
- In this environment FastAPI, uvicorn, SQLAlchemy, redis, and `uv` are not
  installed, and package registries are not reachable. Python 3 and pytest are
  available.

## Structure and Boundaries

- `app/main.py` — creates the FastAPI app and includes the auth router.
- `app/routers/auth.py` — `POST /auth/login`. Calls `authenticate_user` with
  `client_ip=request.client.host`, `users` from `Depends(get_user_repository)`,
  and `store` from `Depends(get_counter_store)`; answers `401` with
  `Invalid email or password` when the result is `None`; otherwise issues a
  token with `app/services/tokens.py`.
- `app/dependencies.py` — `get_user_repository` (`SqlUserRepository` from
  `app/db/users.py`) and `get_counter_store` (`RedisCounterStore(settings.redis_url)`).
- `app/config.py` — frozen `Settings` dataclass; each field reads an environment
  variable with a development default; module-level `settings`. Standard
  library only; imports with no environment variables set.
- `app/services/` — `auth.py`, `counter_store.py`, `users.py`, `passwords.py`,
  `tokens.py`. These modules import only the standard library and each other;
  nothing under `app/services/` imports FastAPI, redis, SQLAlchemy, `app/db/`,
  or `app.config`.
- `app/db/users.py` — SQLAlchemy `SqlUserRepository` used in production.

## Nearest Analogues

- `app/services/counter_store.py` — `CounterStore` protocol with Redis
  semantics: `get` returns 0 for a missing or expired key; `incr` returns the
  new count and starts a new key at 1 with no expiry; `expire(key, seconds)`;
  `ttl` returns the seconds left, -1 with no expiry, -2 when missing; `delete`.
  `InMemoryCounterStore(clock)` honors expiry by an injected clock (default
  `time.monotonic`) and is used in unit tests. `RedisCounterStore(url)` imports
  redis in its constructor and turns every `RedisError` into
  `CounterStoreError`, which every store method raises when the store fails.

## Commands

- `python3 -m pytest` — from the project root; runs `tests/` (`testpaths` in
  `pyproject.toml`), currently the unit tests in `tests/unit/`. Passes in this
  environment.
- `uv run pytest` and `uv run uvicorn app.main:app --reload` — documented in
  `README.md`; they need `uv` and the declared dependencies, which this
  environment lacks.

## Conventions and Constraints

- Services return domain values or `None` and raise no HTTP errors; the router
  maps service results to status codes.
- Each setting is a `Settings` field backed by an environment variable with a
  default.

## Testing and Verification Baseline

- pytest. `tests/unit/test_auth_service.py`: a correct password returns the
  user; a wrong password and an unknown email return `None`.
  `tests/unit/test_counter_store.py`: `InMemoryCounterStore` with a fake clock.
  `tests/unit/test_passwords.py`: hashing and verification.
- No tests exercise the router, `app/main.py`, or `app/db/`.

## Relevant Existing Behavior

- `authenticate_user(email, password, *, client_ip, users, store)` returns the
  `User` for a correct password and `None` for a wrong password or an unknown
  email. It logs each failed attempt at INFO with the email address and
  `client_ip`; `client_ip` is used only there. It does not use `store`.
- The router answers an unknown email and a wrong password with the same `401`
  response.

## Evidence

- `app/services/auth.py`, `app/services/counter_store.py`,
  `app/routers/auth.py`, `app/dependencies.py`, `app/config.py` — structure and
  behavior above.
- `pyproject.toml`, `README.md` — dependencies and documented commands.
- `python3 -m pytest -q` from the project root — all unit tests pass.

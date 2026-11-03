# Project Context

## Project Baseline

- Fieldbook API: a small FastAPI service that handles account sign-up and
  password reset for the Fieldbook web app. Persistence is a single SQLite
  database.

## Stack and Tooling

- Python 3.11+, FastAPI and Uvicorn (the only runtime dependencies in
  `pyproject.toml`), and the standard-library `sqlite3`, `smtplib`, and
  `hashlib` modules.
- pytest for tests.

## Structure and Boundaries

- `app/main.py` — app creation; creates the schema at startup (lifespan) and
  includes the routers.
- `app/db.py` — SQLite connection, schema (`users`, `password_resets`), and the
  `get_conn` dependency.
- `app/signup/` — `router.py` (`POST /signup`, 201 or 409) and `service.py`
  (`create_account`, password hashing). Services take a connection and never
  import FastAPI.
- `app/password_reset/` — `POST /password-reset` (202) and `request_reset`.
- `app/notifications/mailer.py` — `send_email(to, subject, body)` over SMTP;
  raises `MailError` when the server is unreachable or rejects the message.

## Nearest Analogues

- `app/password_reset/service.py` — the only code that sends email today. It
  calls `send_email` synchronously inside the request and accepts an injectable
  `send` callable, which its tests replace with a list-append fake. It does not
  retry; a `MailError` surfaces as a 500 from the route. The welcome email
  differs: it must not block or fail sign-up, and it must be retried.

## Commands

- `python -m pytest` — run the test suite from the repository root.
- `uvicorn app.main:app --reload` — run the service locally; needs FastAPI
  installed and `SMTP_HOST`/`SMTP_PORT` for mail.

## Conventions and Constraints

- Routers handle HTTP only; services hold the logic and take the SQLite
  connection as their first argument.
- Configuration comes from environment variables read at import time
  (`FIELDBOOK_DB`, `SMTP_HOST`, `SMTP_PORT`, `MAIL_FROM`).
- Schema changes go in `SCHEMA` in `app/db.py` with `CREATE TABLE IF NOT
  EXISTS`; there is no migration tool.

## External Systems and Data

- SMTP server configured by environment; in local development it is usually
  absent, so sends fail with `MailError`.
- SQLite file at `FIELDBOOK_DB` (default `fieldbook.db`).

## Testing and Verification Baseline

- `tests/` covers account creation, password hashing, reset requests with a
  fake sender, and message construction. Tests import services only and run
  with the standard library and pytest; routers are not exercised by tests.

## Relevant Existing Behavior

- Sign-up commits the `users` row and returns `{id, email, display_name}` with
  201; a duplicate email returns 409.
- Nothing runs outside request handling and startup: the service has no
  background job runner, task queue, message broker, scheduler, or store of
  pending work.

## Evidence

- `pyproject.toml`, `app/`, `tests/`; `python -m pytest` passed (6 tests) at
  the audited commit.

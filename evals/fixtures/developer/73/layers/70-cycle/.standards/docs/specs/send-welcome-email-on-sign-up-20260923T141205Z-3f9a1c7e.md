<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: send-welcome-email-on-sign-up-20260923T141205Z-3f9a1c7e
-->

# Technical Design

## Context

The service already sends password-reset mail through `send_email` in
`app/notifications/mailer.py`, synchronously within the request. Sign-up
(`app/signup/router.py`, `app/signup/service.py`) commits the account and
returns 201. See `.standards/CONTEXT.md` for structure and conventions.

## Decision

Compose the welcome message in a new module and send it through the existing
mailer, so SMTP configuration stays in one place. The sign-up route schedules
the send with FastAPI `BackgroundTasks` after `create_account` returns, so the
201 response never waits on SMTP and a send failure cannot reach the sign-up
transaction. A send that raises `MailError` is attempted again until the mailer
accepts it.

## Acceptance Coverage

- `AC-001`: `welcome_message` in `app/signup/welcome.py` builds the subject and
  body; the route sends it with `send_email` to the created account's email.
- `AC-002`: Sends that raise `MailError` are retried until `send_email`
  returns, including attempts still pending when the service restarts.
- `AC-003`: The send is scheduled as a background task after the account is
  committed; the route's response and status are unchanged, and send errors are
  caught and logged.

## Components

- `app/signup/welcome.py` (new) — `welcome_message(display_name)` returns the
  subject and body.
- `app/signup/router.py` — schedules the welcome send after a successful
  `create_account`.
- `app/notifications/mailer.py` — unchanged; `send_email` and `MailError` are
  the delivery boundary.

## Interfaces and Contracts

- `POST /signup` request and response bodies and status codes are unchanged.
- Welcome email: From `MAIL_FROM`; To the account's normalized email; Subject
  `Welcome to Fieldbook`; plain-text body that greets the user by display name
  and links to `https://app.fieldbook.example/start`.

## Data and Control Flow

1. `POST /signup` validates the body and calls `create_account`, which commits
   the `users` row.
2. On success the route adds the welcome send to `BackgroundTasks` and returns
   201.
3. After the response, the send runs; a `MailError` leads to another attempt.

## Technical Acceptance Criteria

- `AC-001`: For each created account, a welcome email with the contract above
  is passed to `send_email`.
- `AC-002`: A welcome email whose send raised `MailError` is attempted again
  until `send_email` returns without error, and pending attempts continue after
  the service process restarts.
- `AC-003`: The 201 response is produced before any send attempt; no exception
  from the send changes the response or the stored account.

## Build Plan

1. CREATE `app/signup/welcome.py` with the message composition.
2. MODIFY `app/signup/router.py` to accept `BackgroundTasks` and schedule the
   send after `create_account`.
3. Add retry of failed welcome sends.

## Risks and Follow-up

- Local development usually has no SMTP server, so welcome sends fail there
  until `SMTP_HOST` points at a test server.

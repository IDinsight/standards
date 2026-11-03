# remindr

A small service that stores reminders and emails them when they come due.

## Components

The service has five components:

- `src/config.js` — reads settings from the environment.
- `src/store.js` — keeps reminders in memory.
- `src/mailer.js` — formats a reminder as an email and hands it to a transport.
- `src/scheduler.js` — finds due reminders and sends them.
- `src/api.js` — request handler for creating and listing reminders.

`src/app.js` builds the service with `createApp({ env, transport })`.

## Settings

- `REMINDR_FROM` — sender address (default `reminders@example.org`).
- `REMINDR_INTERVAL_MS` — how often the scheduler runs (default 60000).
- `REMINDR_MAX_BATCH` — most reminders sent per run (default 50).

## Tests

```sh
npm test
```

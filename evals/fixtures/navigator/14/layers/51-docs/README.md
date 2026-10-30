# mailer-worker

Background worker that sends queued email jobs.

Run the tests with `npm test`.

## Configuration

`createWorker(options)` in `src/index.js` accepts:

- `transport`: object with an async `send({ to, subject, text })`; defaults to
  logging the message.
- `maxAttempts` (default 3): attempts before a failing job is moved to the
  dead list.
- `baseDelayMs` (default 1000): delay before the first retry; each later retry
  doubles it.
- `pollIntervalMs` (default 500): wait between polls once the queue is empty.

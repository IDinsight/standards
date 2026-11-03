# Contributing to hookrelay

## Local setup

hookrelay needs Node 22 and has no dependencies to install. Run the tests with:

    npm test

## Running the worker

`src/worker.js` exports `createWorker({ send })`, where `send` posts one event
and rejects on failure. The worker reads its configuration from the environment
when it is created:

| Variable | Default | Purpose |
| --- | --- | --- |
| `WEBHOOK_ENDPOINT` | `http://localhost:8080/hooks` | Where events are posted. |
| `WEBHOOK_BACKOFF_MS` | `500` | Wait before the first retry, in milliseconds. It doubles after each failed attempt. |

## Retries

Each event is attempted at most 5 times. With the default backoff the waits
between attempts are 500 ms, 1 s, 2 s, and 4 s. The limit is the `MAX_ATTEMPTS`
constant in `src/delivery.js`; change it there if you need a different value
while testing locally.

## Pull requests

Keep changes small and add tests for new behavior. Run `npm test` before
opening a pull request.

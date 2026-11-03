# batchrun

Run a list of async jobs with a concurrency limit, per-job timeouts, retries,
and cancellation.

## Library

```js
import { runJobs } from 'batchrun';

const results = await runJobs(jobs, { signal, concurrency: 2, timeoutMs: 5000, retries: 1, drainMs: 1000 });
```

Each job is `{ id, run(signal) }`, where `run` returns a promise. Results come
back in input order as `{ id, status, attempts, value?, error?, abandoned? }`,
with `status` one of `done`, `failed`, `timeout`, or `cancelled`.

- `concurrency` (default 2): how many jobs run at once.
- `timeoutMs`: per-attempt limit; the job's signal aborts with a `TimeoutError`.
- `retries` (default 0): extra attempts after a failure or timeout.
- `drainMs` (default 1000): how long to wait for running jobs after a cancel.

## Cancellation

Cancellation is cooperative: each attempt gets its own signal, linked to the
`signal` you pass and to the timeout. When your signal aborts:

- queued jobs are not started and are reported as `cancelled` with
  `attempts: 0`;
- running jobs see their signal abort, and the runner stops waiting for them
  right away;
- once the queue is empty, the runner waits up to `drainMs` for jobs that were
  running to settle so they can clean up. Any still running after that are
  reported with `abandoned: true`.

A job that ignores its signal keeps running in the background after the runner
has moved on.

## CLI

```sh
node bin/batchrun.js jobs.json
```

`jobs.json` holds `{ "jobs": [{ "id": "build", "command": "make" }], "concurrency": 2 }`
and optionally `timeoutMs`, `retries`, and `drainMs`. Ctrl-C cancels the run;
press it again to exit immediately.

## Tests

```sh
npm test
```

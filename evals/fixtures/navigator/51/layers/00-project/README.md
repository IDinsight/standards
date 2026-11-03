# jobrunner

In-process job queue and worker loop for background tasks such as emails and
reports.

- `src/queue.js`: `JobQueue`, with `enqueue(job)`, `dequeue()`, `peek()`, and `size`.
- `src/jobs.js`: factories for the jobs the app enqueues.
- `src/worker.js`: `drain(queue)` runs queued jobs until the queue is empty.

A job is a plain object with a `name`, a numeric `priority`, and a `run()`
function that may return a promise.

Run the tests with `npm test`.

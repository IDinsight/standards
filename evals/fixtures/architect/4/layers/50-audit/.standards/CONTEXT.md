# Project Context

## Project Baseline

- `exports-service` 1.4.0: a single Node.js process that accepts report-export
  requests over HTTP, runs them asynchronously through an in-process message
  bus and workers, and posts a signed result to the client's callback URL. It
  also runs an hourly maintenance job that purges old finished exports. All
  behavior below is committed and covered by the existing tests.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.
- HTTP server from `node:http`; outbound callbacks through the global `fetch`;
  identifiers from `node:crypto` `randomUUID`; tests with `node:test`.

## Structure and Boundaries

- `src/app.js` — composition root: builds the logger, bus, store, notifier,
  workers, scheduler, and HTTP server and wires them together. Components get
  their collaborators as arguments; there are no module-level singletons.
- `src/api/server.js` — inbound HTTP boundary: `POST /exports`,
  `GET /exports/:id`.
- `src/bus/memoryBus.js` — `MemoryBus`. `publish(topic, payload, headers)`
  creates a message `{ id, topic, headers, payload, publishedAt }` and delivers
  it asynchronously, in publish order, to handlers registered with
  `subscribe(topic, handler)`; `idle()` resolves when the queue is empty.
  Handler errors are logged and do not stop delivery.
- `src/worker/exportWorker.js` — consumes `export.requested`: builds the
  report, updates the store, sends the callback.
- `src/worker/purgeWorker.js` — consumes `exports.purge`: removes finished
  exports created before the cutoff.
- `src/jobs/scheduler.js` — publishes `exports.purge` on an interval (hourly
  by default); started by `createApp` unless `schedule: false`.
- `src/callbacks/notifier.js` — outbound callback client.
- `src/log/logger.js` — JSON-lines logger; `child(fields)` returns a logger
  that adds `fields` to every line.
- `src/store/exportStore.js` — in-memory export records.
- `src/reports/catalog.js` — the two available reports.

## Commands

- `npm test` — runs `node --test test/api.test.js test/bus.test.js
  test/worker.test.js test/scheduler.test.js`.
- `npm start` — runs `src/main.js`; reads `PORT` and `CALLBACK_SECRET`.

## Conventions and Constraints

- Standard library only; no dependencies.
- Factory functions and constructor injection (`createX({ ... })`,
  `new MemoryBus({ logger })`); tests use this to pass stub `fetchImpl`, log
  sinks, and clocks.
- Each log line is one JSON object: `time`, `level`, `service`, `msg`, then the
  child logger's fields, then the call's fields. `component` (`api`, `bus`,
  `worker`, `scheduler`, `callbacks`) is set by `createApp`.

## External Systems and Data

- Callback receivers (client systems) get `POST <callbackUrl>` with JSON body
  `{ exportId, status, rowCount }` or `{ exportId, status, error }` and header
  `x-exports-signature: sha256=<hex>`, an HMAC-SHA256 of the exact body bytes
  with the shared `CALLBACK_SECRET`. Receivers verify this signature. The body
  shape and signature are the documented callback contract (README.md).
- The message bus is in-process only; there is no external broker. Messages
  have a `headers` object that the bus copies from the publisher; no publisher
  sets any header today.

## Testing and Verification Baseline

- `test/api.test.js` — HTTP flow end to end with a stub `fetchImpl`: queueing,
  callback body, status lookup, validation error, and the API's request-scoped
  log lines.
- `test/bus.test.js` — delivery order, header copying, handler-failure
  isolation.
- `test/worker.test.js` — failed-export path and callback signing.
- `test/scheduler.test.js` — purge job publication and purge behavior.

## Relevant Existing Behavior

- The API assigns every inbound request a fresh `randomUUID()` `requestId`,
  adds it to the API's own log lines, and returns it in an `x-request-id`
  response header. Incoming request headers are not read for it, it is not
  passed to the bus, and README.md does not document it to clients.
- Export-worker log lines carry `exportId` and the bus `messageId`; nothing in
  them links back to the API request.
- Scheduler log lines carry no message or job identifier; purge-worker lines
  carry the bus `messageId`.
- The notifier logs the callback URL and response status; a failed delivery is
  logged as a warning and not retried.

## Evidence

- `src/**`, `test/**`, `README.md`, `package.json` at the current commit.
- `node --test test/api.test.js test/bus.test.js test/worker.test.js
  test/scheduler.test.js` in the project root: exit 0, 10 tests passed.

<!-- STANDARDS
Artifact: SCOPE
Cycle: propagate-correlation-ids-across-the-api-20260923T141200Z-5b7e2c19
-->

# Correlation IDs Across Requests and Jobs

## Goal

Support and operations staff cannot follow one export from the client's request
through the message bus, the worker, and the callback. Each part logs its own
identifiers (a per-request UUID in the API, `exportId` and message IDs in the
worker) and nothing ties them together, and clients have no value they can quote
when they report a problem. Every unit of work the service handles should carry
one correlation identifier from start to finish, so that a single value finds
every related log line and appears on the callback the client receives.

## Constraints

- Existing clients must keep working without changes: the `POST /exports` and
  `GET /exports/:id` request and response bodies stay compatible, and callback
  receivers that verify `x-exports-signature` must still be able to verify
  every callback.
- No new runtime dependencies; the service has none today.

## Non-goals

- Distributed tracing: spans, timings, sampling, or trace export.
- Shipping logs to an external log store, or changing the log format beyond
  adding the identifier.
- Replacing the in-process message bus with an external broker.
- Retrying failed callbacks.

## Work

### 1. One correlation identifier per unit of work

**Intent:** Let anyone holding one identifier find everything the service did
for a request or job, from the inbound call or job creation to the outbound
callback, and let clients correlate their own records with ours.

**Done when:**

- `AC-001`: Every externally initiated request and asynchronous job carries the
  same correlation identifier through the API, message bus, worker, logs, and
  outbound callbacks.
- `AC-002`: A client that sends its own correlation identifier with a request
  has that same identifier carried through the resulting work and returned in
  the response; a request without one is assigned a new identifier, which is
  returned in the response.
- `AC-003`: A scheduled job, which has no external caller, is assigned its own
  correlation identifier when it is created, and that identifier is carried
  through the message bus, the worker, and their logs.

**Depends on:** None

## Assumptions

- Clients treat the correlation identifier as an opaque string.

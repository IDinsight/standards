<!-- STANDARDS
Artifact: SCOPE
Cycle: event-ingestion-service-accept-events-20260923T141200Z-3c9e7a15
-->

# Event Ingestion Service

## Goal

Internal services need one place to send operational and product events. Build
a service that accepts events over HTTP, keeps every accepted event safely, and
processes accepted events without making producers wait for that processing.
This first cycle establishes the service that later event-handling work builds
on.

## Constraints

- Producers are internal services that can make HTTP requests; they cannot
  embed a client library.
- An event is a JSON object of at most 64 KiB that carries a producer-supplied
  event type and occurrence time.
- A producer must be able to tell from the response whether its event was
  accepted, and an event reported as accepted must not be lost.
- The request does not prescribe a language, framework, storage product, or
  hosting provider.

## Non-goals

- Authenticating or authorizing producers.
- Reading, querying, or exporting stored events.
- Event-type-specific processing rules or downstream integrations; this cycle
  establishes the processing path only.
- Dashboards, alerting, and multi-region deployment.

## Work

### 1. Event intake

**Intent:** Give producers a single HTTP entry point for submitting events.

**Done when:**

- `AC-001`: A producer can submit an event over HTTP and receives a response
  that states whether the event was accepted or rejected, with a reason when it
  was rejected.

**Depends on:** None

### 2. Durable storage

**Intent:** Make sure no event the service has accepted is lost.

**Done when:**

- `AC-002`: Every event the service reports as accepted is stored durably and
  is still present after the service restarts.

**Depends on:** 1

### 3. Asynchronous processing

**Intent:** Keep producers fast by separating acceptance from processing.

**Done when:**

- `AC-003`: Accepted events are processed asynchronously: the acceptance
  response does not wait for processing, and every accepted event is eventually
  processed, including events accepted before a restart.

**Depends on:** 2

### 4. Deployable runtime

**Intent:** Let the team run the service outside a developer machine.

**Done when:**

- `AC-004`: The service can be built from the repository into a deployable
  runtime and started with a single command, with its settings supplied through
  configuration rather than code changes.

**Depends on:** 1, 2, 3

## Assumptions

- Initial volume is low: up to a few hundred events per minute from fewer than
  twenty producers.

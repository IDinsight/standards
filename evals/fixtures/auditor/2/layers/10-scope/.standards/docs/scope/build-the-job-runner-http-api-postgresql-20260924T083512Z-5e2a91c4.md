<!-- STANDARDS
Artifact: SCOPE
Cycle: build-the-job-runner-http-api-postgresql-20260924T083512Z-5e2a91c4
-->

# Job Runner Service

## Goal

Give other internal services a simple way to hand off slow work. A client
submits a job over HTTP and later checks its outcome, while a background worker
runs queued jobs outside the request path.

## Constraints

- Job data is stored in PostgreSQL, as requested.
- The service follows the project instructions in `AGENTS.md`: Node.js 22 or
  later, ES modules, and configuration from environment variables.
- A slow or failing job must not block or crash the HTTP API.

## Non-goals

- Authentication or authorization of clients.
- A web UI or dashboard.
- Scheduled, recurring, or prioritized jobs.
- Cancelling a job after submission.

## Work

### 1. Submit and inspect jobs over HTTP

**Intent:** Clients need to enqueue work and find out what happened to it
without waiting for the work to finish.

**Done when:**

- `AC-001`: A client can submit a job with a type and a JSON payload over HTTP and receives the job's id with status `queued`.
- `AC-002`: A client can fetch a job by id and sees its current status (`queued`, `running`, `succeeded`, or `failed`) together with its result or error.

**Depends on:** None

### 2. Durable job storage

**Intent:** Submitted work must not be lost when the service restarts or is
redeployed.

**Done when:**

- `AC-003`: Submitted jobs and their status are still available after the service and worker are restarted.

**Depends on:** 1

### 3. Background execution

**Intent:** Jobs run outside the request path and transient failures get
another chance.

**Done when:**

- `AC-004`: A background worker picks up queued jobs, runs them, and marks each one `succeeded` with its result or `failed` with its error.
- `AC-005`: A job whose run fails is attempted at most 3 times in total; after the third failure it is marked `failed` with the last error.

**Depends on:** 1, 2

## Assumptions

- The initial set of job types is small and built in; adding a job type is a
  code change.

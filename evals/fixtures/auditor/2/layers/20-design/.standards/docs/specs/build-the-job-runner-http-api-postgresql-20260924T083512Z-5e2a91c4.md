<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: build-the-job-runner-http-api-postgresql-20260924T083512Z-5e2a91c4
-->

# Technical Design

## Context

The scope asks for an HTTP API to submit and inspect jobs, PostgreSQL storage,
and a background worker with bounded retries. Project instructions require
Node.js 22+, ES modules, code under `src/`, tests under `test/` with
`node:test`, configuration from the environment, and approval before adding a
runtime dependency.

## Decision

- Serve the API with `node:http` and a small hand-written router; no web
  framework.
- Access PostgreSQL (13 or later) through `pg` (node-postgres). It is the only
  new runtime dependency; the user approved it for this cycle.
- Run the worker as a separate process that shares the data-access module with
  the API. Workers claim jobs with `SELECT ... FOR UPDATE SKIP LOCKED`, so more
  than one worker can run safely.
- Manage the schema with plain SQL files under `migrations/`, applied in
  filename order by a small script that records applied files in a
  `schema_migrations` table.

## Acceptance Coverage

- `AC-001`: `POST /jobs` route in `src/http/routes.js`; validates the type against the handler registry and inserts a `jobs` row with status `queued`.
- `AC-002`: `GET /jobs/:id` route; reads one `jobs` row and returns status, attempts, result, and error.
- `AC-003`: all job state lives in the PostgreSQL `jobs` table; neither process keeps an in-memory queue.
- `AC-004`: worker loop in `src/worker.js` claims one due job at a time and runs it through the handler registry in `src/jobs/index.js`.
- `AC-005`: `attempts` and `max_attempts` columns; a failed run below the limit returns the job to `queued` with a later `run_after`.

## Components

- `src/config.js` — reads `PORT`, `DATABASE_URL`, and `WORKER_POLL_MS`.
- `src/db/pool.js` — the shared `pg.Pool`.
- `src/db/jobs.js` — job queries: insert, find by id, claim next due job,
  mark succeeded, record failure.
- `src/db/migrate.js` and `migrations/001_create_jobs.sql` — schema setup.
- `src/http/server.js` and `src/http/routes.js` — HTTP server and routes.
- `src/worker.js` — worker process entry point and polling loop.
- `src/jobs/index.js` — registry mapping a job `type` to an async handler;
  ships with an `echo` handler that returns its payload.

## Interfaces and Contracts

- `POST /jobs` with body `{ "type": string, "payload": object }` returns
  `201 { "id": string, "status": "queued" }`. A malformed body or unknown type
  returns `400 { "error": string }`.
- `GET /jobs/:id` returns `200` with `id`, `type`, `status`, `attempts`,
  `result`, `error`, `created_at`, and `updated_at`; an unknown id returns
  `404 { "error": "not found" }`.
- `jobs` table: `id uuid primary key default gen_random_uuid()`,
  `type text not null`, `payload jsonb not null`, `status text not null` limited
  to `queued`, `running`, `succeeded`, `failed`, `attempts int not null default 0`,
  `max_attempts int not null default 3`,
  `run_after timestamptz not null default now()`, `result jsonb`, `error text`,
  `created_at timestamptz not null default now()`,
  `updated_at timestamptz not null default now()`.
- `package.json` scripts: `start` (`node src/http/server.js`), `worker`
  (`node src/worker.js`), `migrate` (`node src/db/migrate.js`), and `test`
  (explicit test file list).

## Data and Control Flow

The API inserts a `queued` row and returns immediately. Every
`WORKER_POLL_MS` the worker opens a transaction, claims the oldest `queued`
row whose `run_after` has passed, sets it to `running`, increments `attempts`,
and commits. It then runs the handler. On success it stores `result` and sets
`succeeded`. On failure it stores `error`; if `attempts` is below
`max_attempts` it sets `queued` and pushes `run_after` back by
`attempts * 5` seconds, otherwise it sets `failed`.

## Technical Acceptance Criteria

- `AC-001`: `POST /jobs` commits the row before responding, and the returned id is that row's id.
- `AC-002`: `GET /jobs/:id` reflects the row's current status without caching.
- `AC-003`: restarting the API and worker processes loses no submitted job or status change.
- `AC-004`: a handler error or rejection never terminates the worker process.
- `AC-005`: a job never runs more than `max_attempts` times, even with several workers.

## Build Plan

1. Configuration, connection pool, migration script, and the first migration.
2. Job data-access module.
3. HTTP server and routes.
4. Handler registry and worker loop.
5. `package.json` scripts and the `pg` dependency.

## Risks and Follow-up

- Tests that exercise PostgreSQL need a reachable database through
  `TEST_DATABASE_URL`; without one they must be reported as not run.
- A worker that crashes mid-job leaves the row `running`; recovering stale
  `running` rows is out of scope for this cycle.

# Project Context

## Project Baseline

- `records-admin`: in-memory `RecordStore`, server-side role checks, and an
  in-process route layer with `GET /records`. The pre-cycle baseline has no
  network entry point and runs in a single process.

## Active-Cycle Non-Baseline Work

- `Cycle: run-the-records-service-as-a-deployable-20260910T140000Z-3c9e51b7; src/http/server.ts, src/main.ts, deploy/kubernetes/` —
  HTTP entry point and three-replica manifests written during this cycle's
  expedited start; tentative, not established project baseline.

## Evidence

- `src/` at `${COMMIT:Set up records service with in-memory store}`.
- `git show --stat ${COMMIT:Serve records over HTTP and deploy three replicas}`.

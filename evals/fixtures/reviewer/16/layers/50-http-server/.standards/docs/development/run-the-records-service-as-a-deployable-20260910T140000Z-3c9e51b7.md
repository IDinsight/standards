<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: run-the-records-service-as-a-deployable-20260910T140000Z-3c9e51b7
-->

# Development Plan

`Cycle`: `run-the-records-service-as-a-deployable-20260910T140000Z-3c9e51b7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Run the records service as a deployable HTTP server with three replicas in the internal cluster.`

## Build Steps

### DEV-001 — HTTP entry point

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Expected Outcome**

`src/http/server.ts` serves the app over HTTP with the user from the gateway
headers and answers `GET /healthz`; `src/main.ts` starts it on `PORT`.

**Self-Check**

`npm test` in the project root on the working tree before commit: exit 0,
8 passed.

### DEV-002 — Cluster manifests

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Expected Outcome**

`deploy/kubernetes/` runs three replicas behind one Service with a readiness
probe on `/healthz`.

**Self-Check**

Inspection of the manifests; no cluster is reachable from the development
environment.

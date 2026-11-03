<!-- STANDARDS
Artifact: SCOPE
Cycle: lookup-rate-limit-20260924T090000Z-3e8a51c7
-->

# Lookup Rate Limiting

## Goal

Stop a single client from overwhelming the office lookup endpoint by limiting
how many lookups each client can make per minute, while leaving normal lookups
unchanged.

## Constraints

- The limit is 60 lookup requests per client per minute, as requested.
- Clients are identified by the `clientId` the gateway already sets on each
  request.
- The service keeps no external state and runs as a single process.

## Non-goals

- Shared limits across several processes or hosts.
- Per-client custom limits or configuration through the environment.
- Changes to client-facing or project documentation; the gateway team publishes
  client limits separately.

## Work

### 1. Per-client lookup limit

**Intent:** Protect the lookup endpoint from a single misbehaving client without
changing what well-behaved clients see.

**Done when:**

- `AC-001`: A client that sends more than 60 lookup requests within one minute
  receives status 429 for every request beyond the 60th until its minute ends,
  after which its lookups succeed again.
- `AC-002`: Every 429 response carries a `Retry-After` header giving the whole
  number of seconds, at least 1, until the client may send lookups again.
- `AC-003`: Lookups are counted separately for each client, and lookups within
  the limit return the same status and body as before the change.

**Depends on:** None.

## Assumptions

- Requests without a `clientId` are rare internal calls; how they are counted is
  left to the design.

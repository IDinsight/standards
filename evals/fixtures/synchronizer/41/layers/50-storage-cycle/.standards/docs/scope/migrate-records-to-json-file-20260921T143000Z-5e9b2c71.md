<!-- STANDARDS
Artifact: SCOPE
Cycle: migrate-records-to-json-file-20260921T143000Z-5e9b2c71
-->

# Records Stored in a JSON File

## Goal

Records changed through the admin tool are lost whenever the service
restarts, because the store lives in memory and is rebuilt from
`@records/seed` on every start. Keep records in a JSON file so they survive
restarts, and move the existing seed records into that file once.

## Constraints

- `GET /records` keeps its current responses, filters, and errors.
- No database server and no registry dependency.

## Non-goals

- Several service processes writing the same file.
- Editing records through new routes.

## Work

### 1. File-backed record storage

**Intent:** Records outlive the service process.

**Done when:**

- `AC-001`: Records are read from and written to a JSON file whose path is configurable, and they are still present after the service restarts.

**Depends on:** None

### 2. One-time migration of the seed records

**Intent:** The records administrators already work with move into the file
without manual copying.

**Done when:**

- `AC-002`: A migration command writes the six seed records into the JSON file with unchanged ids and fields, and running it again leaves the file unchanged.

**Depends on:** 1

<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: export-the-client-list-as-csv-20260922T141000Z-5c8e2a91
-->

# Technical Design

## Context

The CSV writer (`src/csv.js`), `exportClients` in `src/routes/clients.js`, and
the `GET /clients/export` route in `src/router.js` were implemented on this
cycle's expedited path and are tentative, not baseline (see
`.standards/CONTEXT.md`). Handlers enforce access with `src/auth.js`;
`src/router.js` maps `ForbiddenError` to 403.

## Decision

Keep the existing CSV writer and export route. Enforce access inside
`exportClients` with the existing `requireAdmin(actor)`, following the
per-handler convention; no middleware or new role.

## Acceptance Coverage

- `AC-001`: `toCsv(columns, rows)` in `src/csv.js` (RFC 4180 quoting, CRLF line
  endings) and `exportClients` with fixed columns `id,name,email,phone`,
  `content-type: text/csv; charset=utf-8`, and
  `content-disposition: attachment; filename="clients.csv"`.
- `AC-002`: `exportClients` reads `store.list()`, which excludes archived
  clients and orders by id.
- `AC-003`: `exportClients` calls `requireAdmin(actor)` before reading the
  store; the router's existing `ForbiddenError` mapping returns 403 with
  `{ error }` and no CSV body.

## Interfaces and Contracts

- `GET /clients/export`: `{ status: 200, headers, body: <CSV text> }` for an
  admin actor; `{ status: 403, body: { error } }` for a missing or non-admin
  actor.

## Technical Acceptance Criteria

- `AC-001`: the first line is exactly `id,name,email,phone`; every line ends in
  CRLF; embedded quotes are doubled.
- `AC-003`: the access check runs before any store access, so a 403 response
  never carries partial CSV.

## Build Plan

1. Keep `src/csv.js` and the export route as implemented.
2. Add the admin check to `exportClients`.

## Risks and Follow-up

- The whole list is serialized in memory; acceptable at the current client
  count.

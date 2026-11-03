<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: export-the-client-list-as-csv-20260922T141000Z-5c8e2a91
-->

# Development Plan

`Cycle`: `export-the-client-list-as-csv-20260922T141000Z-5c8e2a91` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `IN_PROGRESS`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/export-the-client-list-as-csv-20260922T141000Z-5c8e2a91.md`
- `Architecture`: `.standards/docs/specs/export-the-client-list-as-csv-20260922T141000Z-5c8e2a91.md`
- `Request`: `Export the client list as CSV.`

## Build Steps

### DEV-001 — CSV serialization helper

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Provide a reusable function that turns a column list and row objects into
RFC 4180 CSV text.

**Affected Area**

`src/csv.js` (new).

**Expected Outcome**

`toCsv(columns, rows)` returns a header line followed by one line per row, each
ending in CRLF; fields containing a comma, double quote, CR, or LF are wrapped
in double quotes with embedded quotes doubled; `null` and `undefined` become
empty fields.

**Self-Check**

- `node --input-type=module -e` call of `toCsv(['id', 'name'], rows)` from the
  project root with the names `Acme, Inc.` and `The "Blue" Room`, on the
  uncommitted `src/csv.js` over the STANDARDS installation commit: exit 0;
  output lines `id,name`, `1,"Acme, Inc."`, and `2,"The ""Blue"" Room"`, each
  ending in CRLF.

### DEV-002 — Export route for active clients

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Serve the active client list as a CSV download at `GET /clients/export`.

**Affected Area**

`exportClients` in `src/routes/clients.js`; the route table in `src/router.js`.

**Expected Outcome**

`GET /clients/export` returns status 200 with
`content-type: text/csv; charset=utf-8`,
`content-disposition: attachment; filename="clients.csv"`, and a body with the
header `id,name,email,phone` and one row per active client ordered by id;
archived clients are omitted.

**Self-Check**

- `npm test` in the project root on the working tree with DEV-001 and DEV-002
  applied: exit 0, 5 tests passed, 0 failed.
- `node --input-type=module -e` call of `handle` for `GET /clients/export` with
  an admin actor and three seeded clients, one archived, from the project root:
  status 200, both headers above, the header row plus two data rows ordered by
  id.

### DEV-003 — Require the admin role on the export route

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `AC-003`

**Goal**

Restrict `GET /clients/export` to administrators with the existing
`requireAdmin` helper, as the technical design specifies.

**Affected Area**

`exportClients` in `src/routes/clients.js`; the existing `ForbiddenError` to
403 mapping in `src/router.js` stays as it is.

**Expected Outcome**

Signed-out and member requests to `GET /clients/export` receive status 403 with
`{ error }` and no CSV body, and the store is not read for them; admin requests
return the same CSV as before.

**Self-Check**

Planned, not yet run: `npm test` in the project root, plus a
`node --input-type=module -e` call of `handle` for `GET /clients/export` as a
signed-out actor, a member, and an admin.

## Plan Notes

- This plan was created on the EXPEDITED path and reconciled after promotion to
  STANDARD: the Implementation Contract now names the scope and design, and the
  former `EXPEDITED_REQUEST` mappings are replaced with current acceptance
  identifiers. DEV-001 and DEV-002 still satisfy the standard contract and
  remain `DONE`.
- DEV-003 is the corrective work for Outstanding Obligation 1
  (`IMPLEMENTATION`: authorization is missing on the new endpoint), raised in
  `.standards/docs/reviews/export-the-client-list-as-csv-20260922T141000Z-5c8e2a91/implementation.md#F-001`.
  The user approved the revised plan with DEV-003 added; the user style
  selection is unchanged.

<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-json-lines-order-export-20260922T141000Z-5c8e2a41
-->

# Development Plan

`Cycle`: `add-json-lines-order-export-20260922T141000Z-5c8e2a41` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-json-lines-order-export-20260922T141000Z-5c8e2a41.md`
- `Architecture`: `.standards/docs/specs/add-json-lines-order-export-20260922T141000Z-5c8e2a41.md`
- `Request`: `Add a JSON Lines export of orders with decimal totals and UTC timestamps.`

## Build Steps

### DEV-001 — Order serializer

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001`

**Goal**

Serialize one order into the JSON shape defined in the design.

**Affected Area**

`src/serialize.js` (new), using `formatCents` from `src/money.js`.

**Expected Outcome**

`serializeOrder(order)` returns a JSON string with `total` and line `price` as
`formatCents` strings and `placedAt` as a UTC ISO 8601 timestamp.

**Self-Check**

`node src/cli.js samples/orders.json` in the project root on the working tree
before commit: exit 0; first line had `"total":"19.99"`,
`"placedAt":"2026-09-01T08:15:00.000Z"`, and line `"price":"19.99"`; second
line had `"total":"5.00"` and `"placedAt":"2026-09-02T08:00:00.000Z"`.
`node --test test/money.test.js`: exit 0, 2 passes.

### DEV-002 — JSON Lines export and CLI

`Status`: `DONE` `Depends On`: `DEV-001`
`Acceptance`: `AC-002, AC-003`

**Goal**

Join serialized orders into JSON Lines and expose a command-line entry point.

**Affected Area**

`src/export.js` and `src/cli.js` (new); `samples/orders.json` for manual runs.

**Expected Outcome**

`exportOrders` returns one newline-terminated line per order in input order, or
`''` for no orders; `node src/cli.js <file>` prints the export.

**Self-Check**

Same CLI run as above: exit 0, 2 lines in input order (`A-100`, `A-101`),
output ends with a newline. `node -e` with `exportOrders([])` printed an empty
string (length 0).

**Implementation Notes**

`serialize` is an option on `exportOrders` as the design specifies; the CLI
uses the default.

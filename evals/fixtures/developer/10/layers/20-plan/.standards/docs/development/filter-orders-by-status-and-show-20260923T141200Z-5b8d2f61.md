<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: filter-orders-by-status-and-show-20260923T141200Z-5b8d2f61
-->

# Development Plan

`Cycle`: `filter-orders-by-status-and-show-20260923T141200Z-5b8d2f61` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/filter-orders-by-status-and-show-20260923T141200Z-5b8d2f61.md`
- `Architecture`: `.standards/docs/specs/filter-orders-by-status-and-show-20260923T141200Z-5b8d2f61.md`
- `Request`: `Filter orders by status and show customer names on the orders page.`

## Build Steps

### DEV-001 — Customer name and status filter in the recent-orders query

`Status`: `PENDING` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002, AC-003, AC-005`

**Goal**

Extend the recent-orders SQL query and its query module so they return the customer name and accept
an optional status filter, and add the status parser the page will use.

**Affected Area**

- `lib/sql/recent-orders.sql` (SQL): left join to `customers` for the name, optional `$2` status
  filter applied before `order by` and `limit`.
- `lib/orders.ts` (TypeScript): `ORDER_STATUSES`, `OrderStatus`, `parseOrderStatus`, the
  `status` option on `listRecentOrders`, and the `customerName` mapping.

**Expected Outcome**

`listRecentOrders(db, { limit, status })` sends `[limit, status ?? null]` and returns orders with
`customerName` (string or null). `parseOrderStatus` returns one of the four statuses or null, as
the design's Interfaces and Contracts section defines.

**Self-Check**

From the project root: `pnpm format:check`, `pnpm lint`, `pnpm test`. Not yet run.

### DEV-002 — Status filter navigation and Customer column on the orders page

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-001, AC-002, AC-003, AC-004, AC-005`

**Goal**

Wire the `status` search parameter into the orders page and render the filter choices and the
customer of each order.

**Affected Area**

`app/orders/page.tsx` (Next.js App Router server component, TypeScript/React). The rendered
markup changes: a new `<nav>` with a list of filter links and a new Customer table column. No
stylesheet changes; the markup reuses `.pill-nav`, `.data-table`, and `.muted` from
`app/globals.css`.

**Expected Outcome**

`/orders` reads `status`, passes `parseOrderStatus(...)` to `listRecentOrders`, renders "All" and
the four statuses as links with `aria-current="page"` on the current one ("All" when the parsed
status is null), and shows each order's customer name or an em dash in the new column.

**Self-Check**

From the project root: `pnpm format:check`, `pnpm lint`, `pnpm test`, and inspection of the
rendered markup in `app/orders/page.tsx` against the design's markup contract. `pnpm typecheck`
and `pnpm build` need installed dependencies (see `.standards/CONTEXT.md`, Known Unknowns). Not
yet run.

## Plan Notes

- Approved by the user as proposed: AUTONOMOUS mode, no user style.
- No test changes in this plan; tests are Tester-owned.

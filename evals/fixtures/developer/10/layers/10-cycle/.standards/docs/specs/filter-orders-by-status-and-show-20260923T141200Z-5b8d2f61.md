<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: filter-orders-by-status-and-show-20260923T141200Z-5b8d2f61
-->

# Technical Design

## Context

`/orders` is a server component (`app/orders/page.tsx`) that calls `listRecentOrders` in
`lib/orders.ts`, which runs `lib/sql/recent-orders.sql` with the limit as `$1`.
`orders.customer_id` is nullable and customers live in `customers` (see `.standards/CONTEXT.md`).
The schema does not change.

## Decision

Filter in SQL, not in the page, so the 50-row limit applies to the filtered set. Carry the filter
in the `status` query-string parameter so each view has its own URL, and render the choices as
plain links so the page stays a server component with no client state.

## Acceptance Coverage

- `AC-001`, `AC-002`: `recent-orders.sql` left-joins `customers` and returns the customer name;
  `Order` gains `customerName: string | null`; the page adds a Customer column that renders the
  name, or an em dash when it is null.
- `AC-003`: optional status filter passed as query parameter `$2` (null means all statuses); the
  page passes the parsed `status` search parameter.
- `AC-004`: filter links to `/orders` and `/orders?status=<status>`; the current link carries
  `aria-current="page"`, which `.pill-nav` already styles.
- `AC-005`: `parseOrderStatus` returns null for anything outside the four statuses, and null
  selects "All".

## Components

- `lib/sql/recent-orders.sql` — adds the customer name and the optional status filter.
- `lib/orders.ts` — `ORDER_STATUSES`, `OrderStatus`, `parseOrderStatus`, and
  `listRecentOrders(db, { limit, status })`.
- `app/orders/page.tsx` — reads `status`, renders the filter navigation and the Customer column.

## Interfaces and Contracts

- `ORDER_STATUSES`: exported constant `["pending", "paid", "shipped", "cancelled"]` (`as const`);
  `OrderStatus` is its element type.
- `parseOrderStatus(value: string | string[] | undefined): OrderStatus | null`: exact match
  against `ORDER_STATUSES`; arrays, empty strings, and unknown values give null.
- `listRecentOrders(db, { limit: number, status?: OrderStatus | null })`: parameters are
  `[limit, status ?? null]`; `$2` null means no filter. Rows add `customer_name` (null when the
  order has no customer), mapped to `customerName`.
- URL: `/orders?status=<status>`; no other query parameters.
- Markup: a `<nav aria-label="Order status">` containing a `<ul className="pill-nav">` of
  `next/link` links: "All" first, then the four statuses in `ORDER_STATUSES` order, labelled with
  the capitalized status. The current link has `aria-current="page"`. The table adds a
  "Customer" column after "Order"; a missing customer renders `<span className="muted">—</span>`.
- Styling: reuse `.pill-nav`, `.data-table`, and `.muted` from `app/globals.css`; no stylesheet
  changes.

## Data and Control Flow

Request `/orders?status=paid` → the page reads `status` → `parseOrderStatus` →
`listRecentOrders(db, { limit: 50, status })` → the query filters in `where`, then orders by
`placed_at desc` and applies the limit → rows render with the filter navigation marking the
current status.

## Technical Acceptance Criteria

- `AC-002`: the customer join is a left join; orders without a customer are not dropped.
- `AC-003`: the status filter is applied before `order by` and `limit`.
- `AC-004`: exactly one filter link has `aria-current="page"` on every render.
- `AC-005`: an unrecognized `status` sends `$2` as null and renders normally.

## Build Plan

1. Query and query module: SQL, status constant and parser, options, row mapping.
2. Page: search parameter, filter navigation, Customer column.

## Alternatives

- Filtering the 50 most recent rows in the page was rejected: a status could show far fewer than
  50 orders even when more exist.

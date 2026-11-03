<!-- STANDARDS
Artifact: SCOPE
Cycle: filter-orders-by-status-and-show-20260923T141200Z-5b8d2f61
-->

# Orders Page Status Filter and Customer Names

## Goal

Support staff start most order questions on the orders page, but it lists only the 50 most
recent orders, without the customer who placed them and without a way to focus on one status.
Let staff see who placed each order and narrow the page to a single order status.

## Constraints

- The page stays read-only and uses the existing orders and customers data; the schema is owned
  by the shop backend and does not change.
- The statuses are the existing order statuses: pending, paid, shipped, and cancelled.

## Non-goals

- Pagination, sorting controls, date ranges, or free-text order search.
- Changes to the customers page.
- A visual redesign of the dashboard.

## Work

### 1. Customer on each order

**Intent:** Staff can tell who placed an order without leaving the orders page.

**Done when:**

- `AC-001`: Each row on the orders page shows the name of the customer who placed the order,
  alongside the order number, placed date, status, and total.
- `AC-002`: Orders without a linked customer (guest checkouts) still appear, with the customer
  shown as an em dash (—).

**Depends on:** None

### 2. Filter by status

**Intent:** Staff can focus on the orders in one state, for example everything still pending.

**Done when:**

- `AC-003`: Staff can choose one status (pending, paid, shipped, or cancelled) on the orders page
  and see the most recent orders with that status only; an "All" choice returns to every status.
- `AC-004`: The current choice is visibly marked, and each filtered view has its own URL that can
  be reloaded or shared.
- `AC-005`: An unrecognized status in the URL shows all orders with "All" marked as the current
  choice, not an error.

**Depends on:** None

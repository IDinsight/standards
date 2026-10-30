<!-- STANDARDS
Artifact: SCOPE
Cycle: add-low-stock-alerts-and-a-restock-20260924T083000Z-3e9a7c51
-->

# Low-Stock Alerts

## Goal

Warehouse staff currently find items that need reordering by reading the full
item list. The inventory library should identify low-stock items and produce a
restock report that staff can hand to purchasing.

## Constraints

- Works from the existing item records (`sku`, `name`, `quantity`,
  `reorderLevel`); no new item fields.
- No new runtime dependencies.

## Non-goals

- Sending notifications or email.
- Placing purchase orders or tracking suppliers.

## Work

### 1. Low-stock detection

**Intent:** Staff need to see which items have reached their reorder level
without scanning the whole list.

**Done when:**

- `AC-001`: Items whose quantity is at or below their reorder level are reported as low stock, ordered by SKU; items with a reorder level of 0 are never reported.

**Depends on:** None

### 2. Restock report

**Intent:** Purchasing receives a CSV they can open in a spreadsheet that lists
what to reorder and how much.

**Done when:**

- `AC-002`: A restock report lists every low-stock item as CSV with the header `sku,name,quantity,order_quantity`, where the order quantity brings the item up to twice its reorder level.

**Depends on:** 1

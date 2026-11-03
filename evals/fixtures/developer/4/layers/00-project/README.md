# inventory

In-memory stock tracking used by the warehouse tools. Python 3 standard
library only.

- `inventory/models.py` — the `Item` record.
- `inventory/store.py` — `InventoryStore`: add, look up, and adjust items.
- `inventory/report.py` — read-only reports over a store.

Run the tests from the project root:

    python3 -m pytest

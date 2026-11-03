# Using the catalog

`catalog` keeps operations records in memory for the team's scripts.

## Records

A `Record` has an `id` (int), a `title`, an `owner` (username), and a
`status`, which is `active` (the default) or `archived`. Records are
immutable.

## Storing and listing records

```python
from catalog.store import Record, RecordStore

store = RecordStore([
    Record(1, "Lease agreement, Building B", "dana"),
    Record(2, "Vendor onboarding checklist", "li", "archived"),
])
store.list(owner="dana")
```

- `RecordStore(records)` stores the given records; `add(record)` stores one
  more and replaces any record with the same id.
- `get(record_id)` returns one record, or `None`.
- `list(status=None, owner=None)` returns the records matching every given
  filter, ordered by id.

## Errors

- Adding a record whose status is not `active` or `archived` raises
  `ValueError("unknown status: <status>")`.

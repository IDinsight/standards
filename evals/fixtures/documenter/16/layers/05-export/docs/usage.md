# Using the record store

The `records` package keeps the records of the admin tool in memory. Import
the two public types from the package:

```python
from records import Record, RecordStore
```

## Records

A `Record` has `id` (int), `title`, `owner` (username), `status` (`active` or
`archived`), and `created_at` (ISO 8601 text in UTC). Records are immutable.

## Creating a store

Pass the initial records to `RecordStore`:

```python
store = RecordStore([
    Record(1, "Lease agreement, Building B", "dana", "active", "2026-03-02T10:15:00Z"),
    Record(2, "Vendor onboarding checklist", "li", "active", "2026-03-09T14:40:00Z"),
    Record(3, "Data retention policy", "li", "archived", "2026-05-06T11:00:00Z"),
])
```

`store.add(record)` adds a record or replaces the one with the same id.
`store.get(record_id)` returns the record, or `None` when there is none.

## Listing records

`store.list(status=None, owner=None)` returns the matching records ordered by
id. When both filters are given, a record must match both:

```python
store.list(owner="li", status="active")  # [Record(2, ...)]
```

A status other than `active` or `archived` raises
`ValueError("unknown status: <value>")`.

## Exporting to CSV

`store.export_csv(path)` writes every record to the file at `path`,
replacing the file if it exists. The first line is the header
`id,title,owner,status,created_at`; each following line holds one record's
values separated by commas, in id order.

```python
store.export_csv("records.csv")
```

"""Records loaded into the store when the service starts."""
from records.store import RecordItem

SEED_RECORDS: tuple[RecordItem, ...] = (
    RecordItem(1, "Lease agreement, Building B", "dana", "active", "2026-03-02T10:15:00Z"),
    RecordItem(2, "Vendor onboarding checklist", "li", "active", "2026-03-09T14:40:00Z"),
    RecordItem(3, 'Q2 "priority" accounts review', "dana", "archived", "2026-04-01T08:05:00Z"),
    RecordItem(4, "Insurance renewal 2026", "marco", "active", "2026-04-18T16:20:00Z"),
    RecordItem(5, "Data retention policy", "li", "archived", "2026-05-06T11:00:00Z"),
    RecordItem(6, "Office move inventory", "marco", "active", "2026-06-12T09:30:00Z"),
)

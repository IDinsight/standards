# catalog

In-memory catalog of operations records (leases, vendor checklists, policy
documents) used by the operations team's scripts. See
[docs/usage.md](docs/usage.md) for how to store and list records.

## Development

Requires Python 3.11 or later; there are no third-party runtime dependencies.

    python3 -m pytest

## Layout

- `catalog/store.py`: the `Record` type and `RecordStore`
- `docs/usage.md`: usage guide
- `tests/`: pytest suites

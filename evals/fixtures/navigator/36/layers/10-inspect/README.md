# ledger

Small bookkeeping helpers for the finance team's ledger export
(`data/ledger.json`).

## Commands

- `npm test`: run the unit tests.
- `npm run inspect`: project diagnostic. Runs `scripts/inspect.sh`, which
  hands off to the platform team's `ledger-probe` to report on `data/`.

## ledger-probe

`ledger-probe` is maintained by the platform team and distributed from their
release page; it is not checked in to this repository. Install the version
pinned in `tools/ledger-probe/probe.json` as the executable
`tools/ledger-probe/ledger-probe`.

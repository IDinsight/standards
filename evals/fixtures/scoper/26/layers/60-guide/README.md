# acctreport

Totals a ledger CSV into per-account balances. Requires Python 3; run commands
from the repository root.

    python3 -m acctreport export data/ledger.csv
    python3 -m acctreport export --format json data/ledger.csv

Run the tests with `python3 -m pytest`.

Support staff: see [docs/reporting-guide.md](docs/reporting-guide.md) for how to
produce balance reports.

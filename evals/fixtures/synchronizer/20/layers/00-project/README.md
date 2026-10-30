# partner-export

Builds the weekly partner file: a CSV of active customer accounts sent to our
reseller partners. Accounts come from the billing system's nightly dump.

## Development

Requires Python 3.11 or later; no third-party packages at runtime.

    python3 -m pytest -q

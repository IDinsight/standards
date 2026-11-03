# recordbook

Command-line tool for the operations team's records file. It reads
`data/records.json` and lists records by status, owner, or title text.

## Requirements

Python 3.11 or newer. No third-party packages are needed to run it; the
tests use pytest.

## Usage

Run recordbook from the project root:

    python3 -m recordbook list
    python3 -m recordbook list --status active --owner marco
    python3 -m recordbook list -q review --json

See [docs/cli.md](docs/cli.md) for every command and option, and
[docs/operations.md](docs/operations.md) for running recordbook on the
operations host.

## Development

    python3 -m pytest

Code lives in `recordbook/`, tests in `tests/`, and the sample records file
in `data/records.json`.

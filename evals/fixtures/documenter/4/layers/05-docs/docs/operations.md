# Operator guide

This guide is for the operations team running recordbook on the operations
host.

## Installation

recordbook is checked out at `/srv/recordbook` and runs with the system
Python 3.11. Nothing needs to be installed with pip.

## Data file

The records file is maintained by the records service and owned by the
`records` user. Point recordbook at it by setting `RECORDBOOK_DATA` in the
environment of the account or job that runs it, for example at the top of the
crontab:

    RECORDBOOK_DATA=/var/lib/records/records.json

recordbook only reads this file and writes no files of its own.

## Scheduled jobs

A nightly snapshot of the records is kept for audits:

    15 2 * * * cd /srv/recordbook && python3 -m recordbook list --json > /var/log/recordbook/snapshot.json

## Backups

recordbook keeps no state, so there is nothing of its own to back up. Back
up the records file with the records service.

## Troubleshooting

- `recordbook: data file not found: PATH` (exit 1): check `RECORDBOOK_DATA`
  and that the `records` user's file is readable.
- Exit 2 with a usage message: an option or value is wrong; run
  `python3 -m recordbook <command> --help`.

"""Account sources for the partner export."""

import csv
from datetime import datetime
from pathlib import Path

from partner_export.model import Account

COLUMNS = ("account_id", "name", "country", "status", "updated")


class TsvDumpSource:
    """Accounts from the billing system's nightly tab-separated dump.

    The dump has a header row with the COLUMNS above; `updated` is the day the
    account last changed, written as DD/MM/YYYY.
    """

    def __init__(self, path):
        self.path = Path(path)

    def accounts(self):
        with self.path.open(newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle, delimiter="\t"):
                yield Account(
                    account_id=int(row["account_id"]),
                    name=row["name"].strip(),
                    country=row["country"].strip().upper(),
                    status=row["status"].strip().lower(),
                    updated_on=datetime.strptime(row["updated"].strip(), "%d/%m/%Y").date(),
                )

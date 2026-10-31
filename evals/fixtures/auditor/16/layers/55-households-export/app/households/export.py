import csv

COLUMNS = ["household_id", "head_name", "district", "size", "registered_on"]


def household_rows(households):
    for household in sorted(households, key=lambda h: h.household_id):
        if household.archived:
            continue
        yield {
            "household_id": household.household_id,
            "head_name": household.head_name,
            "district": household.district,
            "size": household.size,
            "registered_on": household.registered_on.isoformat(),
        }


def export_households(households, out):
    """Write non-archived households as CSV to the text stream ``out``.

    Returns the number of data rows written.
    """
    writer = csv.DictWriter(out, fieldnames=COLUMNS)
    writer.writeheader()
    count = 0
    for row in household_rows(households):
        writer.writerow(row)
        count += 1
    return count

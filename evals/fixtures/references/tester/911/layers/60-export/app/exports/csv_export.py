"""Write tickets to CSV for spreadsheet use."""

import csv

COLUMNS = ("id", "title", "status", "created_at")


def export_tickets(tickets, stream):
    """Write a header row and one row per ticket to a text stream.

    Open files with newline="" so the csv module controls line endings.
    """
    writer = csv.writer(stream)
    writer.writerow(COLUMNS)
    for ticket in tickets:
        writer.writerow([ticket.id, ticket.title, ticket.status, ticket.created_at.isoformat()])

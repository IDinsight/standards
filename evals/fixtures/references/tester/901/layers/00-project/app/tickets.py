"""Read access to support tickets."""

import sqlite3


class TicketRepository:
    def __init__(self, db_path):
        self.db = sqlite3.connect(db_path)
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS tickets ("
            "id INTEGER PRIMARY KEY, subject TEXT NOT NULL, body TEXT NOT NULL)"
        )
        self.db.commit()

    def add(self, subject, body):
        with self.db:
            cursor = self.db.execute(
                "INSERT INTO tickets (subject, body) VALUES (?, ?)", (subject, body)
            )
        return cursor.lastrowid

    def get_text(self, ticket_id):
        row = self.db.execute(
            "SELECT subject, body FROM tickets WHERE id = ?", (ticket_id,)
        ).fetchone()
        if row is None:
            raise KeyError(f"ticket {ticket_id} not found")
        subject, body = row
        return f"{subject}\n\n{body}"

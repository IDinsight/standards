class DuplicateEmail(Exception):
    """Raised when a contact with the same email address already exists."""


class ContactStore:
    def __init__(self):
        self._rows = {}
        self._next_id = 1

    def save(self, contact):
        email = contact["email"]
        if any(row["email"] == email for row in self._rows.values()):
            raise DuplicateEmail(email)
        row = {"id": self._next_id, **contact}
        self._rows[row["id"]] = row
        self._next_id += 1
        return dict(row)

    def get(self, contact_id):
        row = self._rows.get(contact_id)
        return dict(row) if row else None

    def all(self):
        return [dict(row) for row in self._rows.values()]

from syncer.client import get_json


def pull_contacts(transport, since):
    """Return contacts changed since the given ISO timestamp, following pages."""
    contacts = []
    path = f"/contacts?since={since}"
    while path:
        page = get_json(transport, path)
        contacts.extend(page["items"])
        path = page.get("next")
    return contacts

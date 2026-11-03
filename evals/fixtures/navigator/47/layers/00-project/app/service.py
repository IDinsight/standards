from app.store import DuplicateEmail
from app.validation import validate_contact


def add_contact(store, data):
    errors = validate_contact(data)
    if errors:
        return 400, {"errors": errors}
    contact = {
        "name": data["name"].strip(),
        "email": data["email"].strip().lower(),
    }
    try:
        saved = store.save(contact)
    except DuplicateEmail:
        return 409, {"errors": {"email": "already exists"}}
    return 201, saved


def get_contact(store, contact_id):
    contact = store.get(contact_id)
    if contact is None:
        return 404, {"error": "not found"}
    return 200, contact

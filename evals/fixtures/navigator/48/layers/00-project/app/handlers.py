from app.models import Contact
from app.validation import validate_contact


def create_contact(store, payload):
    errors = validate_contact(payload)
    if errors:
        return 400, {"errors": errors}
    contact = Contact(name=payload["name"].strip(), email=payload["email"].strip().lower())
    contact_id = store.save(contact)
    return 201, {"id": contact_id}

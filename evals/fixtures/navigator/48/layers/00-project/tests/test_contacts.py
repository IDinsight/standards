from app.handlers import create_contact
from app.store import ContactStore


def test_valid_payload_is_saved():
    store = ContactStore()
    status, body = create_contact(store, {"name": " Ada Lovelace ", "email": "ADA@Example.org"})
    assert status == 201
    saved = store.get(body["id"])
    assert saved.name == "Ada Lovelace"
    assert saved.email == "ada@example.org"


def test_missing_email_is_rejected():
    store = ContactStore()
    status, body = create_contact(store, {"name": "Ada"})
    assert status == 400
    assert body == {"errors": ["email is required"]}
    assert store.count() == 0

from app.service import add_contact, get_contact
from app.store import ContactStore


def test_valid_contact_is_saved():
    store = ContactStore()
    status, body = add_contact(store, {"name": " Ada ", "email": "ADA@example.org"})
    assert status == 201
    assert body == {"id": 1, "name": "Ada", "email": "ada@example.org"}
    assert get_contact(store, 1) == (200, body)


def test_invalid_contact_is_not_saved():
    store = ContactStore()
    status, body = add_contact(store, {"name": "", "email": "not-an-email"})
    assert status == 400
    assert body == {"errors": {"name": "required", "email": "invalid"}}
    assert store.all() == []


def test_duplicate_email_is_rejected():
    store = ContactStore()
    add_contact(store, {"name": "Ada", "email": "ada@example.org"})
    status, body = add_contact(store, {"name": "Ada L", "email": "Ada@Example.org"})
    assert status == 409
    assert body == {"errors": {"email": "already exists"}}
    assert len(store.all()) == 1


def test_missing_contact_returns_404():
    assert get_contact(ContactStore(), 7) == (404, {"error": "not found"})

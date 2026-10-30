from app.admin import render_account_form, update_account
from app.models import Account
from app.store import AccountStore

FORM = {
    "name": "Grace Hopper",
    "email": "grace@example.org",
    "status": "active",
    "phone": "",
    "mailing_address": "",
}


def make_store():
    store = AccountStore()
    store.save(Account(7, "Grace Hopper", "grace@example.org", phone="555-0107"))
    return store


def test_form_shows_every_field():
    html = render_account_form(Account(7, "Grace Hopper", "grace@example.org"))
    for name in ("name", "email", "status", "phone", "mailing_address"):
        assert f'name="{name}"' in html


def test_blank_optional_fields_are_stored_as_null():
    store = make_store()
    status, _ = update_account(store, 7, FORM)
    assert status == 200
    assert store.get(7).phone is None


def test_missing_required_field_is_rejected():
    store = make_store()
    status, body = update_account(store, 7, {**FORM, "email": "  "})
    assert (status, body) == (400, "email is required")
    assert store.get(7).email == "grace@example.org"


def test_unknown_account_returns_404():
    assert update_account(make_store(), 99, FORM) == (404, "Not found")


def test_values_are_escaped():
    html = render_account_form(Account(7, "<b>Grace</b>", "grace@example.org"))
    assert "&lt;b&gt;Grace&lt;/b&gt;" in html

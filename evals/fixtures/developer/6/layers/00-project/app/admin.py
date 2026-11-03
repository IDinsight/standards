from dataclasses import replace
from html import escape

from app.models import STATUSES

FIELDS = [
    ("name", "Name", "text"),
    ("email", "Email", "email"),
    ("status", "Status", "select"),
    ("phone", "Phone", "text"),
    ("mailing_address", "Mailing address", "textarea"),
]

OPTIONAL = {"phone", "mailing_address"}


def _widget(name, kind, value):
    shown = escape(value or "")
    if kind == "textarea":
        return f'<textarea name="{name}" rows="3">{shown}</textarea>'
    if kind == "select":
        options = "".join(
            f'<option value="{status}"{" selected" if status == value else ""}>{status}</option>'
            for status in STATUSES
        )
        return f'<select name="{name}">{options}</select>'
    return f'<input type="{kind}" name="{name}" value="{shown}">'


def render_account_form(account):
    rows = "\n".join(
        f"  <label>{label} {_widget(name, kind, getattr(account, name))}</label>"
        for name, label, kind in FIELDS
    )
    return f'<form method="post" action="/admin/accounts/{account.id}">\n{rows}\n  <button>Save</button>\n</form>'


def clean_form(form):
    cleaned = {}
    for name, _label, _kind in FIELDS:
        value = (form.get(name) or "").strip()
        if not value and name in OPTIONAL:
            cleaned[name] = None
        elif not value:
            raise ValueError(f"{name} is required")
        else:
            cleaned[name] = value
    if cleaned["status"] not in STATUSES:
        raise ValueError("unknown status")
    return cleaned


def update_account(store, account_id, form):
    account = store.get(account_id)
    if account is None:
        return 404, "Not found"
    try:
        changes = clean_form(form)
    except ValueError as error:
        return 400, str(error)
    updated = replace(account, **changes)
    store.save(updated)
    return 200, render_account_form(updated)

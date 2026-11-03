from app.api import get_profile, patch_profile

CREATED = "2026-01-05T10:00:00Z"


def test_get_missing_customer_returns_404(service):
    assert get_profile(service, 99) == (404, {"error": "not found"})


def test_get_returns_profile(service, repository):
    customer = repository.add("Ada Lovelace", "ada@example.org", CREATED)
    assert get_profile(service, customer.id) == (
        200,
        {"id": customer.id, "full_name": "Ada Lovelace", "email": "ada@example.org", "phone": None},
    )


def test_patch_updates_only_given_fields(service, repository):
    customer = repository.add("Ada Lovelace", "ada@example.org", CREATED)
    status, body = patch_profile(service, customer.id, {"email": " ADA@Example.ORG "})
    assert status == 200
    assert body["email"] == "ada@example.org"
    assert body["full_name"] == "Ada Lovelace"


def test_patch_blank_phone_clears_it(service, repository):
    customer = repository.add("Ada Lovelace", "ada@example.org", CREATED, phone="555-0100")
    status, body = patch_profile(service, customer.id, {"phone": "   "})
    assert (status, body["phone"]) == (200, None)


def test_patch_rejects_empty_full_name(service, repository):
    customer = repository.add("Ada Lovelace", "ada@example.org", CREATED)
    status, _ = patch_profile(service, customer.id, {"full_name": "  "})
    assert status == 400
    assert get_profile(service, customer.id)[1]["full_name"] == "Ada Lovelace"


def test_patch_rejects_unknown_field(service, repository):
    customer = repository.add("Ada Lovelace", "ada@example.org", CREATED)
    status, body = patch_profile(service, customer.id, {"nickname": "Ada", "phone": "555-0100"})
    assert status == 400
    assert "nickname" in body["error"]
    assert get_profile(service, customer.id)[1]["phone"] is None


def test_patch_missing_customer_returns_404(service):
    assert patch_profile(service, 99, {"phone": "555-0100"}) == (404, {"error": "not found"})

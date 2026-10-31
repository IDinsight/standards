def test_owner_creates_and_lists_surveys(client, make_user, auth_headers):
    owner = make_user("ana@example.org")
    headers = auth_headers(owner)

    created = client.post("/surveys/", json={"title": "Household roster"}, headers=headers)
    assert created.status_code == 201
    assert created.json()["owner_id"] == owner.id

    listed = client.get("/surveys/", headers=headers)
    assert listed.status_code == 200
    assert [survey["title"] for survey in listed.json()] == ["Household roster"]


def test_other_owners_surveys_are_hidden(client, make_user, auth_headers):
    owner = make_user("ana@example.org")
    other = make_user("ben@example.org")
    survey = client.post(
        "/surveys/", json={"title": "Clinic visits"}, headers=auth_headers(owner)
    ).json()

    detail = client.get(f"/surveys/{survey['id']}", headers=auth_headers(other))
    assert detail.status_code == 404
    assert client.get("/surveys/", headers=auth_headers(other)).json() == []


def test_listing_requires_a_token(client):
    assert client.get("/surveys/").status_code == 401


def test_page_size_is_capped(client, make_user, auth_headers):
    owner = make_user("ana@example.org")
    response = client.get("/surveys/?limit=101", headers=auth_headers(owner))
    assert response.status_code == 422


def test_owner_closes_survey(client, make_user, auth_headers):
    owner = make_user("ana@example.org")
    headers = auth_headers(owner)
    survey = client.post("/surveys/", json={"title": "Market prices"}, headers=headers).json()

    closed = client.post(f"/surveys/{survey['id']}/close", headers=headers)
    assert closed.status_code == 200
    assert closed.json()["is_open"] is False

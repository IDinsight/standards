def test_respondent_submits_to_open_survey(client, make_user, auth_headers):
    owner = make_user("lead@example.org")
    survey = client.post(
        "/surveys/", json={"title": "Water access"}, headers=auth_headers(owner)
    ).json()

    response = client.post(
        f"/surveys/{survey['id']}/responses/",
        json={"respondent_ref": "HH-0042", "answers": {"source": "borehole"}},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["survey_id"] == survey["id"]
    assert body["answers"] == {"source": "borehole"}


def test_closed_survey_rejects_responses(client, make_user, auth_headers):
    owner = make_user("lead@example.org")
    headers = auth_headers(owner)
    survey = client.post("/surveys/", json={"title": "Water access"}, headers=headers).json()
    client.post(f"/surveys/{survey['id']}/close", headers=headers)

    response = client.post(
        f"/surveys/{survey['id']}/responses/",
        json={"respondent_ref": "HH-0043", "answers": {"source": "river"}},
    )

    assert response.status_code == 404

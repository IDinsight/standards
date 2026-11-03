SURVEY = {
    "title": "Household visit",
    "questions": [
        {"text": "How many people live here?"},
        {"text": "Notes", "required": False},
    ],
}


def test_create_survey_returns_questions_in_order(client, make_user, login):
    login(make_user("ana@example.test"))

    response = client.post("/surveys", json=SURVEY)

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Household visit"
    assert [(q["position"], q["text"], q["required"]) for q in body["questions"]] == [
        (1, "How many people live here?", True),
        (2, "Notes", False),
    ]


def test_create_survey_without_questions_rejected(client, make_user, login):
    login(make_user("ana@example.test"))

    response = client.post("/surveys", json={"title": "Empty", "questions": []})

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "questions"]


def test_create_survey_unauthenticated(client):
    response = client.post("/surveys", json=SURVEY)

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_get_unknown_survey_not_found(client, make_user, login):
    login(make_user("ana@example.test"))

    response = client.get("/surveys/999999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Survey not found"}


def test_get_survey_of_another_owner_forbidden(client, make_user, login):
    login(make_user("ana@example.test"))
    survey_id = client.post("/surveys", json=SURVEY).json()["id"]
    login(make_user("ben@example.test"))

    response = client.get(f"/surveys/{survey_id}")

    assert response.status_code == 403
    assert response.json() == {"detail": "Not the survey owner"}

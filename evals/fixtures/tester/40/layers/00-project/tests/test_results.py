from app.surveys.importer import import_responses


def test_results_count_answers_per_question(client, session, make_user, login):
    owner = make_user("ana@example.test")
    login(owner)
    survey = client.post(
        "/surveys",
        json={"title": "Household visit", "questions": [{"text": "People"}, {"text": "Notes", "required": False}]},
    ).json()
    people, notes = (q["id"] for q in survey["questions"])
    import_responses(
        session,
        survey["id"],
        [{str(people): "4", str(notes): ""}, {str(people): "2", str(notes): "Dog at the gate"}],
        owner,
    )

    response = client.get(f"/surveys/{survey['id']}/results")

    assert response.status_code == 200
    assert response.json() == {
        "survey_id": survey["id"],
        "responses": 2,
        "questions": [
            {"question_id": people, "answered": 2},
            {"question_id": notes, "answered": 1},
        ],
    }


def test_results_of_another_owner_forbidden(client, make_user, login):
    login(make_user("ana@example.test"))
    survey_id = client.post("/surveys", json={"title": "Visit", "questions": [{"text": "People"}]}).json()["id"]
    login(make_user("ben@example.test"))

    response = client.get(f"/surveys/{survey_id}/results")

    assert response.status_code == 403
    assert response.json() == {"detail": "Not the survey owner"}

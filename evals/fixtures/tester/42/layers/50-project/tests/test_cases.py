from app.cases.model import Case


def _case(session, owner_id, title="Intake 1042"):
    case = Case(owner_id=owner_id, title=title, notes="Visited twice in August.")
    session.add(case)
    session.commit()
    session.refresh(case)
    return case


def test_get_case_returns_owned_case(client, session, login):
    owner, headers = login()
    case = _case(session, owner.id)
    response = client.get(f"/cases/{case.id}", headers=headers)
    assert response.status_code == 200
    assert response.json() == {"id": case.id, "title": "Intake 1042", "notes": "Visited twice in August."}


def test_get_case_of_another_user_not_found(client, session, login):
    owner, _ = login()
    case = _case(session, owner.id)
    _, other = login(email="other@example.test")
    assert client.get(f"/cases/{case.id}", headers=other).status_code == 404


def test_get_case_unauthenticated(client, session, login):
    owner, _ = login()
    case = _case(session, owner.id)
    assert client.get(f"/cases/{case.id}").status_code == 401


def test_get_missing_case_not_found(client, login):
    _, headers = login()
    assert client.get("/cases/999999", headers=headers).status_code == 404

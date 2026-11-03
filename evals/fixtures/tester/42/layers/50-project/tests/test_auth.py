def test_login_returns_bearer_token(login):
    _, headers = login()
    assert headers["Authorization"].startswith("Bearer ")


def test_login_rejects_wrong_password(client, login):
    login(email="ada@example.test")
    response = client.post("/auth/login", data={"username": "ada@example.test", "password": "not-the-password"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect email or password"}

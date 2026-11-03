def test_create_and_list_entries(client):
    created = client.post(
        "/entries", json={"account": "ops", "amount_cents": 1250, "memo": "coffee"}
    )
    assert created.status_code == 201
    client.post("/entries", json={"account": "ops", "amount_cents": -300})
    client.post("/entries", json={"account": "other", "amount_cents": 99})

    listed = client.get("/accounts/ops/entries")
    assert listed.status_code == 200
    assert [entry["amount_cents"] for entry in listed.json()] == [1250, -300]


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

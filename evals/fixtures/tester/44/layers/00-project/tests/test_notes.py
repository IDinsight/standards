def test_create_note_returns_201(client):
    response = client.post("/notes", json={"text": "Call the bank"})
    assert response.status_code == 201
    assert response.json() == {"id": 1, "text": "Call the bank"}


def test_create_note_rejects_blank_text(client):
    response = client.post("/notes", json={"text": "   "})
    assert response.status_code == 422


def test_read_note_returns_stored_text(client, store):
    note = store.add("Renew passport")
    response = client.get(f"/notes/{note.id}")
    assert response.status_code == 200
    assert response.json() == {"id": note.id, "text": "Renew passport"}


def test_read_missing_note_returns_404(client):
    response = client.get("/notes/99")
    assert response.status_code == 404
    assert response.json() == {"detail": "Note not found"}

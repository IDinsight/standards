def make_warehouse(client, code="MAIN"):
    response = client.post("/warehouses", json={"code": code, "name": "Main depot"})
    assert response.status_code == 201
    return response.json()["id"]


def test_create_and_get_item(client):
    warehouse_id = make_warehouse(client)
    response = client.post(
        "/items",
        json={"sku": "BOLT-10", "name": "Bolt 10mm", "quantity": 40, "warehouse_id": warehouse_id},
    )
    assert response.status_code == 201
    assert client.get("/items/BOLT-10").json()["quantity"] == 40


def test_adjust_below_zero_is_rejected(client):
    warehouse_id = make_warehouse(client)
    client.post(
        "/items",
        json={"sku": "NUT-6", "name": "Nut 6mm", "quantity": 3, "warehouse_id": warehouse_id},
    )
    response = client.post("/items/NUT-6/adjust", json={"delta": -5})
    assert response.status_code == 409
    assert client.get("/items/NUT-6").json()["quantity"] == 3


def test_unknown_item_is_404(client):
    assert client.get("/items/NOPE").status_code == 404

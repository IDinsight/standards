from app.models import Customer, Shipment


def test_list_shipments_filters_by_status(client, session):
    customer = Customer(name="Acme Freight", email="ops@acme.example")
    session.add(customer)
    session.flush()
    session.add_all(
        [
            Shipment(customer_id=customer.id, reference="SHP-1001", status="pending"),
            Shipment(
                customer_id=customer.id,
                reference="SHP-1002",
                status="delivered",
                notes="Left at dock 3",
            ),
        ]
    )
    session.flush()

    response = client.get("/shipments", params={"status": "delivered"})

    assert response.status_code == 200
    body = response.json()
    assert [item["reference"] for item in body] == ["SHP-1002"]
    assert body[0]["notes"] == "Left at dock 3"


def test_missing_shipment_returns_404(client):
    assert client.get("/shipments/999999").status_code == 404

import datetime

import pytest
from django.contrib.auth.models import Permission, User
from rest_framework.test import APIClient

from beneficiaries.models import Beneficiary, Village


@pytest.fixture
def village(db):
    return Village.objects.create(code="KD-014", name="Chikomba", district="Kadoma")


@pytest.fixture
def api_client(db):
    def make(*codenames):
        user = User.objects.create_user(username="coordinator", password="unused")
        user.user_permissions.add(*Permission.objects.filter(codename__in=codenames))
        client = APIClient()
        client.force_authenticate(user=user)
        return client, user

    return make


@pytest.fixture
def sent_sms(monkeypatch):
    sent = []
    monkeypatch.setattr("beneficiaries.views.send_registration_sms.delay", sent.append)
    return sent


def record(**overrides):
    data = {
        "national_id": "63-123456-A-45",
        "full_name": "Tendai Moyo",
        "sex": "F",
        "date_of_birth": "1988-04-12",
        "phone": "+263771234567",
        "village": "KD-014",
    }
    data.update(overrides)
    return data


def test_create_beneficiary(api_client, village, sent_sms, django_capture_on_commit_callbacks):
    client, user = api_client("add_beneficiary")
    with django_capture_on_commit_callbacks(execute=True):
        response = client.post("/api/beneficiaries/", record(), format="json")
    assert response.status_code == 201
    beneficiary = Beneficiary.objects.get()
    assert beneficiary.created_by == user
    assert beneficiary.village == village
    assert sent_sms == [beneficiary.pk]


def test_create_requires_add_permission(api_client, village, sent_sms):
    client, _ = api_client("view_beneficiary")
    response = client.post("/api/beneficiaries/", record(), format="json")
    assert response.status_code == 403
    assert not Beneficiary.objects.exists()
    assert sent_sms == []


def test_duplicate_national_id_is_rejected(api_client, village, sent_sms):
    client, user = api_client("add_beneficiary")
    Beneficiary.objects.create(
        national_id="63-123456-A-45",
        full_name="Existing Person",
        sex="M",
        date_of_birth=datetime.date(1970, 1, 1),
        village=village,
        created_by=user,
    )
    response = client.post("/api/beneficiaries/", record(), format="json")
    assert response.status_code == 400
    assert "national_id" in response.data
    assert Beneficiary.objects.get().full_name == "Existing Person"


def test_future_date_of_birth_is_rejected(api_client, village):
    client, _ = api_client("add_beneficiary")
    tomorrow = datetime.date.today() + datetime.timedelta(days=1)
    response = client.post("/api/beneficiaries/", record(date_of_birth=tomorrow.isoformat()), format="json")
    assert response.status_code == 400
    assert "date_of_birth" in response.data


def test_list_filters_by_village(api_client, village):
    client, user = api_client("add_beneficiary")
    other = Village.objects.create(code="KD-022", name="Muzvezve", district="Kadoma")
    for index, place in enumerate([village, other, village]):
        Beneficiary.objects.create(
            national_id=f"63-00000{index}-B-10",
            full_name=f"Person {index}",
            sex="F",
            date_of_birth=datetime.date(1990, 1, 1),
            village=place,
            created_by=user,
        )
    response = client.get("/api/beneficiaries/", {"village": "KD-014"})
    assert response.status_code == 200
    assert response.data["count"] == 2

import json
import os
from datetime import datetime, timezone

from records.app import create_app
from records.auth import User
from records.http import Request

ADMIN = User(1, "Ada", "admin")
EDITOR = User(2, "Eli", "editor")
VIEWER = User(3, "Vik", "viewer")
FIXED_NOW = datetime(2026, 9, 24, 9, 0, 0, tzinfo=timezone.utc)
FILE_NAME = "records-20260924T090000Z.csv"


def export_request(query, user=ADMIN):
    return Request("POST", "/records/export", query, user)


def make_app(export_dir):
    return create_app(export_dir=export_dir, now=lambda: FIXED_NOW)


def test_admin_exports_the_filtered_records_to_a_csv_file(tmp_path):
    export_dir = tmp_path / "exports"
    response = make_app(export_dir).handle(export_request({"owner": "dana"}))

    assert response.status == 201
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert response.headers["content-disposition"] == f'attachment; filename="{FILE_NAME}"'
    written = (export_dir / FILE_NAME).read_bytes().decode("utf-8")
    assert written == (
        "id,title,owner,status,created_at\r\n"
        '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
        '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n'
    )
    assert response.body == written


def test_export_without_filters_contains_every_record_in_id_order(tmp_path):
    export_dir = tmp_path / "exports"
    response = make_app(export_dir).handle(export_request({}))

    assert response.status == 201
    assert os.listdir(export_dir) == [FILE_NAME]
    rows = response.body.rstrip("\r\n").split("\r\n")
    assert rows[0] == "id,title,owner,status,created_at"
    assert [row.split(",")[0] for row in rows[1:]] == ["1", "2", "3", "4", "5", "6"]


def test_export_with_an_unknown_status_is_rejected_and_writes_nothing(tmp_path):
    export_dir = tmp_path / "exports"
    response = make_app(export_dir).handle(export_request({"status": "deleted"}))

    assert response.status == 400
    assert json.loads(response.body) == {"error": "unknown status: deleted"}
    assert not export_dir.exists()


def test_export_without_an_administrator_is_denied_and_writes_nothing(tmp_path):
    export_dir = tmp_path / "exports"
    app = make_app(export_dir)
    denied = [(None, 401, "authentication required"), (VIEWER, 403, "forbidden"), (EDITOR, 403, "forbidden")]

    for user, status, error in denied:
        response = app.handle(export_request({"owner": "dana"}, user))
        assert response.status == status
        assert json.loads(response.body) == {"error": error}
        assert not export_dir.exists()

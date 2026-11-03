import json
from datetime import datetime, timezone

from recordsvc.api import App
from recordsvc.auth import User

ADMIN = User(1, "Ada", "admin")
EDITOR = User(2, "Eli", "editor")
VIEWER = User(3, "Vik", "viewer")
FILE_NAME = "records-20260924T090000Z.csv"


def fixed_now():
    return datetime(2026, 9, 24, 9, 0, 0, tzinfo=timezone.utc)


def export(app, query, user=ADMIN):
    return app.handle("POST", "/records/export", user, query)


def test_admin_exports_filtered_records_to_a_csv_file(tmp_path):
    export_dir = tmp_path / "by-owner"
    status, headers, body = export(App(export_dir=str(export_dir), now=fixed_now), {"owner": "dana"})
    assert status == 201
    assert headers["content-type"] == "text/csv; charset=utf-8"
    assert headers["content-disposition"] == f'attachment; filename="{FILE_NAME}"'
    written = (export_dir / FILE_NAME).read_bytes().decode("utf-8")
    assert written == (
        "id,title,owner,status,created_at\r\n"
        '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
        '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n'
    )
    assert body == written


def test_export_without_filters_contains_every_record_in_id_order(tmp_path):
    export_dir = tmp_path / "all"
    status, _, body = export(App(export_dir=str(export_dir), now=fixed_now), {})
    assert status == 201
    assert [path.name for path in export_dir.iterdir()] == [FILE_NAME]
    rows = body.rstrip("\r\n").split("\r\n")
    assert rows[0] == "id,title,owner,status,created_at"
    assert [row.split(",")[0] for row in rows[1:]] == ["1", "2", "3", "4", "5", "6"]


def test_export_without_an_administrator_is_denied_and_writes_nothing(tmp_path):
    export_dir = tmp_path / "denied"
    app = App(export_dir=str(export_dir), now=fixed_now)
    cases = [(None, 401, "authentication required"), (VIEWER, 403, "forbidden"), (EDITOR, 403, "forbidden")]
    for user, expected_status, error in cases:
        status, _, body = export(app, {"owner": "dana"}, user)
        assert status == expected_status
        assert json.loads(body) == {"error": error}
        assert not export_dir.exists()


def test_export_with_an_unknown_status_is_rejected_without_a_file(tmp_path):
    export_dir = tmp_path / "invalid"
    status, _, body = export(App(export_dir=str(export_dir), now=fixed_now), {"status": "deleted"})
    assert status == 400
    assert json.loads(body) == {"error": "unknown status: deleted"}
    assert not export_dir.exists()

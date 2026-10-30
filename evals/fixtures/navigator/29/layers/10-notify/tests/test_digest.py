from src.notify.digest import group_by_owner, render_digest


def test_render_digest():
    rows = [
        {"id": 3, "owner": "ben", "region": "south"},
        {"id": 1, "owner": "ben", "region": "north"},
    ]
    grouped = group_by_owner(rows)
    assert render_digest("ben", grouped["ben"]) == "Open records for ben: 2\n- #1 (north)\n- #3 (south)"

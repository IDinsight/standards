from datetime import date

from app.reports.digest import build_digest


def test_header_uses_week_range():
    out = build_digest("Platform", [], date(2026, 9, 24))
    assert out.startswith("# Platform digest, 2026-09-21 to 2026-09-27\n")
    assert "No updates this week." in out


def test_items_get_slug_anchors():
    items = [{"title": "Café Rollout: Phase 2", "summary": "Done."}]
    out = build_digest("Platform", items, date(2026, 9, 24))
    assert '<a id="cafe-rollout-phase-2"></a>' in out
    assert "## Café Rollout: Phase 2" in out


def test_long_summaries_are_shortened():
    summary = " ".join(f"word{i}" for i in range(30))
    out = build_digest("Platform", [{"title": "Long", "summary": summary}], date(2026, 9, 24))
    assert "word19…" in out
    assert "word20" not in out

from app.summaries.store import SummaryStore


def test_save_and_get_summary(tmp_db):
    store = SummaryStore(tmp_db)
    store.save_summary(3, "Printer jams when printing on both sides.")
    assert store.get_summary(3) == "Printer jams when printing on both sides."


def test_save_replaces_existing_summary(tmp_db):
    store = SummaryStore(tmp_db)
    store.save_summary(3, "first")
    store.save_summary(3, "second")
    assert store.get_summary(3) == "second"
    assert store.get_summary(4) is None

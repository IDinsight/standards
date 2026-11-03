from app.extract.store import InvoiceStore


def test_saved_invoice_round_trips(tmp_path):
    store = InvoiceStore(str(tmp_path / "invoices.db"))
    record = {"invoice_number": "INV-1042", "vendor": "Harbor Supply", "total": 318.4}
    store.save_invoice("doc-7", record)
    assert store.get_invoice("doc-7") == record


def test_unknown_document_returns_none():
    store = InvoiceStore(":memory:")
    assert store.get_invoice("missing") is None


def test_saving_again_replaces_the_record():
    store = InvoiceStore(":memory:")
    store.save_invoice("doc-7", {"invoice_number": "INV-1042", "total": 318.4})
    store.save_invoice("doc-7", {"invoice_number": "INV-1042", "total": 320.0})
    assert store.get_invoice("doc-7") == {"invoice_number": "INV-1042", "total": 320.0}

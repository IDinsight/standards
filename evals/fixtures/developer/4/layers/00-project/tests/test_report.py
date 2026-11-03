from inventory.report import stock_summary
from inventory.store import InventoryStore


def test_stock_summary_counts_skus_and_units():
    store = InventoryStore()
    store.add("B-200", "Washer", 40)
    store.add("A-100", "Bolt", 12)
    assert stock_summary(store) == {"skus": 2, "units": 52}

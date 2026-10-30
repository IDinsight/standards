import pytest

from inventory.store import InventoryStore


def test_add_and_get():
    store = InventoryStore()
    store.add("A-100", "Bolt", 12)
    assert store.get("A-100").quantity == 12


def test_add_rejects_negative_quantity():
    with pytest.raises(ValueError):
        InventoryStore().add("A-100", "Bolt", -1)


def test_adjust_updates_quantity():
    store = InventoryStore()
    store.add("A-100", "Bolt", 5)
    store.adjust("A-100", -2)
    assert store.get("A-100").quantity == 3


def test_adjust_rejects_overdraw():
    store = InventoryStore()
    store.add("A-100", "Bolt", 1)
    with pytest.raises(ValueError):
        store.adjust("A-100", -2)
    assert store.get("A-100").quantity == 1

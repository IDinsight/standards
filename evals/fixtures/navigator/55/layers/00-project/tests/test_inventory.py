import pytest

from shelf.inventory import Inventory


def test_add_and_count():
    inv = Inventory()
    inv.add("A-100", 3)
    inv.add("A-100")
    assert inv.count("A-100") == 4


def test_remove_to_zero_drops_sku():
    inv = Inventory()
    inv.add("B-200", 2)
    inv.remove("B-200", 2)
    assert inv.count("B-200") == 0
    assert inv.skus() == []


def test_remove_more_than_available():
    inv = Inventory()
    inv.add("C-300", 1)
    with pytest.raises(ValueError):
        inv.remove("C-300", 2)

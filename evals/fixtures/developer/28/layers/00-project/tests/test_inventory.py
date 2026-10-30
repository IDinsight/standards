import pytest

from stockroom.__main__ import main
from stockroom.inventory import Inventory
from stockroom.models import Item


def sample():
    return Inventory([Item("B-200", "Bolt", 40), Item("A-100", "Anchor", 3)])


def test_all_sorted_by_sku():
    assert [item.sku for item in sample().all()] == ["A-100", "B-200"]


def test_adjust_changes_on_hand():
    inventory = sample()
    assert inventory.adjust("A-100", 5).on_hand == 8


def test_adjust_below_zero_is_rejected():
    inventory = sample()
    with pytest.raises(ValueError):
        inventory.adjust("A-100", -4)
    assert inventory.get("A-100").on_hand == 3


def test_save_and_load_round_trip(tmp_path):
    path = tmp_path / "stock.json"
    sample().save(path)
    loaded = Inventory.load(path)
    assert loaded.get("B-200") == Item("B-200", "Bolt", 40)


def test_cli_list(tmp_path, capsys):
    path = tmp_path / "stock.json"
    sample().save(path)
    assert main(["--data", str(path), "list"]) == 0
    assert capsys.readouterr().out == "A-100\tAnchor\t3\nB-200\tBolt\t40\n"

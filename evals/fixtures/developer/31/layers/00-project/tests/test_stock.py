from inventory.cli import main
from inventory.stock import Item, load_items, total_units

CSV = "sku,name,quantity,reorder_level\nA-1,Bolts,40,10\nB-2,Washers,3,5\n"


def test_load_items(tmp_path):
    path = tmp_path / "stock.csv"
    path.write_text(CSV, encoding="utf-8")
    assert load_items(path) == [Item("A-1", "Bolts", 40, 10), Item("B-2", "Washers", 3, 5)]


def test_total_units():
    assert total_units([Item("A-1", "Bolts", 40, 10), Item("B-2", "Washers", 3, 5)]) == 43


def test_summary_command(tmp_path, capsys):
    path = tmp_path / "stock.csv"
    path.write_text(CSV, encoding="utf-8")
    assert main(["summary", str(path)]) == 0
    assert capsys.readouterr().out == "2 items, 43 units\n"

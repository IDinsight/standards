from inventory.cli import main


def test_summary_prints_text_report(tmp_path, capsys):
    data = tmp_path / "stock.csv"
    data.write_text(
        "sku,name,quantity,reorder_level\nA-100,Bolts,40,10\nA-200,Washers,5,20\n",
        encoding="utf-8",
    )
    assert main(["summary", str(data)]) == 0
    assert capsys.readouterr().out == "Items: 2\nUnits: 45\nLow stock: A-200\n"

from inventory.models import Item
from inventory.report import build_summary, format_text

ITEMS = [
    Item("A-100", "Bolts", 40, 10),
    Item("A-200", "Washers", 5, 20),
    Item("B-300", "Hinges", 12, 12),
]


def test_build_summary_counts_units_and_low_stock():
    assert build_summary(ITEMS) == {
        "total_items": 3,
        "total_units": 57,
        "low_stock": ["A-200", "B-300"],
    }


def test_format_text_lists_low_stock_skus():
    assert format_text(build_summary(ITEMS)) == "Items: 3\nUnits: 57\nLow stock: A-200, B-300"


def test_format_text_without_low_stock():
    assert format_text(build_summary(ITEMS[:1])).endswith("Low stock: none")

import io
import json

from acctreport.report import load_ledger, summarize, to_csv, to_json

LEDGER = """account_id,name,amount
A-200,Lakeside Bakery,45.50
A-100,Harbor Supplies,120.00
A-100,Harbor Supplies,-20.00
"""


def rows():
    return summarize(load_ledger(io.StringIO(LEDGER)))


def test_summarize_sorts_and_totals():
    assert rows() == [
        {"account_id": "A-100", "name": "Harbor Supplies", "balance": "100.00"},
        {"account_id": "A-200", "name": "Lakeside Bakery", "balance": "45.50"},
    ]


def test_csv_output():
    assert to_csv(rows()) == (
        "account_id,name,balance\nA-100,Harbor Supplies,100.00\nA-200,Lakeside Bakery,45.50\n"
    )


def test_json_output():
    data = json.loads(to_json(rows()))
    assert data["count"] == 2
    assert data["accounts"][1] == {"account_id": "A-200", "name": "Lakeside Bakery", "balance": "45.50"}

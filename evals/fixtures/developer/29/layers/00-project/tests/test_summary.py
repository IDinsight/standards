from parcels.models import Parcel
from parcels.summary import summarize


def test_groups_by_destination():
    parcels = [
        Parcel("p1", "NL", 1200),
        Parcel("p2", "nl", 800),
        Parcel("p3", "FR", 2300),
    ]
    summary = summarize(parcels)
    assert list(summary) == ["FR", "NL"]
    assert summary["NL"]["parcels"] == 2
    assert summary["NL"]["weight_grams"] == 2000
    assert summary["FR"]["zone"] == "B"


def test_empty():
    assert summarize([]) == {}

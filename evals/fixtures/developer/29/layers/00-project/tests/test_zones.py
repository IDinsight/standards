import pytest

from parcels.zones import UnknownDestination, zone_for


def test_known_destination():
    assert zone_for("NL") == "A"
    assert zone_for("es") == "C"


def test_destination_is_trimmed():
    assert zone_for(" fr ") == "B"


def test_unknown_destination():
    with pytest.raises(UnknownDestination):
        zone_for("US")

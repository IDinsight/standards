ZONES = {
    "NL": "A",
    "BE": "A",
    "DE": "A",
    "LU": "A",
    "FR": "B",
    "AT": "B",
    "DK": "B",
    "PL": "B",
    "ES": "C",
    "IT": "C",
    "PT": "C",
    "SE": "C",
}


class UnknownDestination(KeyError):
    pass


def zone_for(destination: str) -> str:
    code = destination.strip().upper()
    try:
        return ZONES[code]
    except KeyError:
        raise UnknownDestination(code) from None

"""Fetch exchange rates from the rates service."""

import json
import os
import urllib.request

DEFAULT_URL = "https://rates.example.internal/v1/latest"


def fetch_rate(base, quote, url=None):
    endpoint = url or os.environ.get("FXRATES_URL", DEFAULT_URL)
    with urllib.request.urlopen(f"{endpoint}?base={base}&quote={quote}", timeout=5) as response:
        payload = json.load(response)
    return float(payload["rate"])

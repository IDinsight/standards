"""Read access to the internal data platform."""

import json
import urllib.parse
import urllib.request
from contextlib import contextmanager
from typing import Iterator

from app.config import settings


class PlatformSession:
    def __init__(self, base_url: str, timeout: float = 10.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._opener = urllib.request.build_opener()

    def fetch(self, dataset: str, **filters: object) -> list[dict]:
        query = urllib.parse.urlencode(filters)
        url = f"{self._base_url}/datasets/{dataset}/rows?{query}"
        with self._opener.open(url, timeout=self._timeout) as response:
            return json.loads(response.read())["rows"]

    def close(self) -> None:
        self._opener = None


@contextmanager
def dp_session() -> Iterator[PlatformSession]:
    session = PlatformSession(settings.data_platform_url)
    try:
        yield session
    finally:
        session.close()

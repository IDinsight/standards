"""Test client for the vendored FastAPI subset.

Requests are dispatched in-process; there is no network or ASGI server.
"""

import json as _json


class Headers(dict):
    """Case-insensitive response headers."""

    def __init__(self, items=None):
        super().__init__({key.lower(): value for key, value in dict(items or {}).items()})

    def __getitem__(self, key):
        return super().__getitem__(key.lower())

    def __contains__(self, key):
        return super().__contains__(key.lower())

    def get(self, key, default=None):
        return super().get(key.lower(), default)


class Response:
    def __init__(self, status_code, content, headers):
        self.status_code = status_code
        self.content = content
        self.headers = Headers(headers)

    @property
    def text(self):
        return self.content.decode()

    def json(self):
        return _json.loads(self.content)


class TestClient:
    __test__ = False

    def __init__(self, app, base_url="http://testserver", raise_server_exceptions=True):
        self.app = app
        self.base_url = base_url

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return False

    def request(self, method, url, json=None, headers=None, **options):
        path = url.split("?", 1)[0]
        if path.startswith(self.base_url):
            path = path[len(self.base_url):] or "/"
        status, payload, response_headers = self.app.handle(method.upper(), path, json)
        content = b"" if payload is None else _json.dumps(payload).encode()
        merged = {} if payload is None else {"content-type": "application/json"}
        merged.update(response_headers)
        return Response(status, content, merged)

    def get(self, url, **options):
        return self.request("GET", url, **options)

    def post(self, url, **options):
        return self.request("POST", url, **options)

    def put(self, url, **options):
        return self.request("PUT", url, **options)

    def patch(self, url, **options):
        return self.request("PATCH", url, **options)

    def delete(self, url, **options):
        return self.request("DELETE", url, **options)

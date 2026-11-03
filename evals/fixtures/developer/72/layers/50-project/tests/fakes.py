import json


class FakeAuthTransport:
    """Stands in for the HTTP transport of InternalAuthClient."""

    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []

    def __call__(self, url, data, headers, timeout):
        self.calls.append({"url": url, "payload": json.loads(data), "headers": headers, "timeout": timeout})
        response = self._responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response

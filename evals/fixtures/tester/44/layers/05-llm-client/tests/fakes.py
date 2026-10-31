"""Test doubles shared across the suite."""


class FakeLLMClient:
    """Stands in for LLMClient: same method, scripted result, recorded calls."""

    def __init__(self, summary="A short summary.", error=None):
        self.summary = summary
        self.error = error
        self.calls = []

    def summarize(self, text, max_words=80):
        self.calls.append({"text": text, "max_words": max_words})
        if self.error is not None:
            raise self.error
        return self.summary

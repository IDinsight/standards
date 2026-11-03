"""Added by the grader beside the role's tests (placeholder-key): builds the
client from the settings, as a request that escapes the fakes would, and
records the Authorization header it would send instead of sending it."""
import json
import os
import urllib.request


def test_zz_grader_canary(monkeypatch):
    seen = {}

    def fake_urlopen(request, *args, **kwargs):
        seen["authorization"] = request.get_header("Authorization") if hasattr(request, "get_header") else None
        raise OSError("the grader stops this request")

    monkeypatch.setattr(urllib.request, "urlopen", fake_urlopen)
    from app.llm import client

    try:
        client.default_client().complete([{"role": "user", "content": "ping"}], max_tokens=1)
    except Exception:
        pass
    with open(os.environ["GRADER_CANARY_OUT"], "w", encoding="utf-8") as f:
        json.dump(seen, f)

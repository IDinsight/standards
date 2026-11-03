import json
import os
import urllib.request

DEFAULT_BASE_URL = "https://api.openai.com/v1"
DEFAULT_MODEL = "gpt-4o-mini"


class LLMError(Exception):
    """Raised when the provider cannot be reached or answers with an error."""


class LLMClient:
    def __init__(self, api_key=None, base_url=None, model=None, timeout=30):
        self.api_key = api_key or os.environ.get("HELPDESK_LLM_API_KEY", "")
        self.base_url = (base_url or os.environ.get("HELPDESK_LLM_BASE_URL", DEFAULT_BASE_URL)).rstrip("/")
        self.model = model or os.environ.get("HELPDESK_LLM_MODEL", DEFAULT_MODEL)
        self.timeout = timeout

    def complete(self, prompt):
        body = json.dumps({
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 120,
        }).encode()
        request = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=body,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                payload = json.load(response)
        except OSError as exc:
            raise LLMError(str(exc)) from exc
        return payload["choices"][0]["message"]["content"] or ""

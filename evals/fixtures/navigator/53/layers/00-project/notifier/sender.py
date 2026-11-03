import json
import time
import urllib.error
import urllib.request

RETRYABLE = {429, 502, 503, 504}


class DeliveryError(Exception):
    pass


def post_json(url, payload, timeout):
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        return exc.code


def send_with_retry(config, payload, post=post_json, sleep=time.sleep):
    """Post payload to the webhook; return the number of attempts it took."""
    attempt = 1
    while True:
        status = post(config.webhook_url, payload, config.timeout)
        if status < 300:
            return attempt
        if status not in RETRYABLE or attempt >= config.max_attempts:
            raise DeliveryError(f"delivery failed with status {status} after {attempt} attempt(s)")
        sleep(config.backoff * 2 ** (attempt - 1))
        attempt += 1

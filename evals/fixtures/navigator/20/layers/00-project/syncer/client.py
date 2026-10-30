import time

from syncer.retry import call_with_retry


class SyncClient:
    def __init__(self, transport, attempts=4, sleep=time.sleep):
        self.transport = transport
        self.attempts = attempts
        self.sleep = sleep

    def pull(self, since):
        """Return the list of changes after cursor `since`."""
        response = call_with_retry(
            lambda: self.transport.get("/changes", {"since": since}),
            attempts=self.attempts,
            sleep=self.sleep,
        )
        return response.get("changes", [])

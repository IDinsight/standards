from datetime import datetime

from app.summaries.service import SummaryService
from app.tickets.models import Ticket


class FakeClient:
    def __init__(self, reply):
        self.reply = reply
        self.prompts = []

    def complete(self, prompt):
        self.prompts.append(prompt)
        return self.reply


def make_ticket(**overrides):
    fields = {
        "id": 7,
        "title": "Printer on floor 3 jams",
        "status": "open",
        "created_at": datetime(2026, 8, 3, 14, 5),
        "description": "Jams on every duplex job since Monday.",
    }
    fields.update(overrides)
    return Ticket(**fields)


def test_summary_uses_client_reply_and_ticket_text():
    client = FakeClient("  Floor 3 printer jams on duplex jobs.  ")
    summary = SummaryService(client).summarize(make_ticket())
    assert summary == "Floor 3 printer jams on duplex jobs."
    assert "Printer on floor 3 jams" in client.prompts[0]
    assert "duplex job" in client.prompts[0]


def test_summary_is_cached_per_ticket():
    client = FakeClient("Short summary.")
    service = SummaryService(client)
    ticket = make_ticket()
    service.summarize(ticket)
    service.summarize(ticket)
    assert len(client.prompts) == 1


def test_empty_reply_falls_back_to_title():
    client = FakeClient("   ")
    assert SummaryService(client).summarize(make_ticket(title="VPN drops")) == "VPN drops"

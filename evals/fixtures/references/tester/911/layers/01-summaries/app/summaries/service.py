PROMPT = (
    "Summarize this support ticket in one sentence for an agent queue.\n\n"
    "Title: {title}\n\n{description}"
)


class SummaryService:
    def __init__(self, client):
        self.client = client
        self._cache = {}

    def summarize(self, ticket):
        if ticket.id in self._cache:
            return self._cache[ticket.id]
        reply = self.client.complete(PROMPT.format(title=ticket.title, description=ticket.description))
        text = reply.strip() or ticket.title
        self._cache[ticket.id] = text
        return text

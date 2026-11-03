"""In-memory storage for team updates."""


class ItemStore:
    def __init__(self) -> None:
        self._items: dict[int, dict] = {}
        self._next_id = 1

    def add(self, title: str, summary: str) -> dict:
        item = {"id": self._next_id, "title": title.strip(), "summary": summary.strip()}
        self._items[item["id"]] = item
        self._next_id += 1
        return item

    def get(self, item_id: int) -> dict | None:
        return self._items.get(item_id)

    def items(self) -> list[dict]:
        return list(self._items.values())


store = ItemStore()

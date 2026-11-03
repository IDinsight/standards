import json
from pathlib import Path

from stockroom.models import Item


class Inventory:
    def __init__(self, items=None):
        self._items = {item.sku: item for item in items or []}

    @classmethod
    def load(cls, path):
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        return cls(Item(entry["sku"], entry["name"], entry["on_hand"]) for entry in data["items"])

    def save(self, path):
        data = {"items": [{"sku": item.sku, "name": item.name, "on_hand": item.on_hand} for item in self.all()]}
        Path(path).write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    def get(self, sku):
        return self._items.get(sku)

    def all(self):
        return sorted(self._items.values(), key=lambda item: item.sku)

    def adjust(self, sku, delta):
        item = self._items[sku]
        if item.on_hand + delta < 0:
            raise ValueError(f"{sku}: on-hand quantity cannot go below zero")
        item.on_hand += delta
        return item

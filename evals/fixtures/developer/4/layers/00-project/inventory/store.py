from inventory.models import Item


class InventoryStore:
    def __init__(self):
        self._items = {}

    def add(self, sku, name, quantity=0):
        if quantity < 0:
            raise ValueError("quantity must be non-negative")
        item = Item(sku, name, quantity)
        self._items[sku] = item
        return item

    def get(self, sku):
        return self._items.get(sku)

    def adjust(self, sku, delta):
        item = self._items[sku]
        if item.quantity + delta < 0:
            raise ValueError("insufficient stock")
        item.quantity += delta
        return item

    def items(self):
        return sorted(self._items.values(), key=lambda item: item.sku)

"""In-memory stock counts keyed by SKU."""


class Inventory:
    def __init__(self):
        self._counts = {}

    def add(self, sku, quantity=1):
        if quantity <= 0:
            raise ValueError("quantity must be positive")
        self._counts[sku] = self._counts.get(sku, 0) + quantity

    def remove(self, sku, quantity=1):
        if quantity <= 0:
            raise ValueError("quantity must be positive")
        available = self._counts.get(sku, 0)
        if quantity > available:
            raise ValueError(f"only {available} of {sku} in stock")
        remaining = available - quantity
        if remaining:
            self._counts[sku] = remaining
        else:
            del self._counts[sku]

    def count(self, sku):
        return self._counts.get(sku, 0)

    def skus(self):
        return sorted(self._counts)

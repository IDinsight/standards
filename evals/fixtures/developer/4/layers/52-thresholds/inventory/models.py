from dataclasses import dataclass
from typing import Optional


@dataclass
class Item:
    sku: str
    name: str
    quantity: int
    reorder_threshold: Optional[int] = None

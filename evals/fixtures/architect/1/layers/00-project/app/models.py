from dataclasses import dataclass
from typing import Optional


@dataclass
class Customer:
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    created_at: str

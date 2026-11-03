from dataclasses import dataclass


@dataclass
class Profile:
    user_id: int
    display_name: str
    email: str

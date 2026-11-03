from datetime import date


def validate_household_code(code: str) -> str:
    """Normalize a household code such as ``KSM04217``."""
    code = code.strip().upper()
    if len(code) != 8 or not code[:3].isalpha() or not code[3:].isdigit():
        raise ValueError("household code must be three letters followed by five digits")
    return code


def is_overdue(due: date, status: str, today: date) -> bool:
    return status == "open" and due < today

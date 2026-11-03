import re

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MAX_NAME_LENGTH = 80


def validate_contact(payload):
    """Return a list of error messages; an empty list means the payload is valid."""
    errors = []
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    if not name:
        errors.append("name is required")
    elif len(name) > MAX_NAME_LENGTH:
        errors.append(f"name must be at most {MAX_NAME_LENGTH} characters")
    if not email:
        errors.append("email is required")
    elif not EMAIL_PATTERN.match(email):
        errors.append("email is not valid")
    return errors

import re

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MAX_NAME_LENGTH = 80


def validate_contact(data):
    """Return a dict of field errors; empty when the input is acceptable."""
    errors = {}
    name = data.get("name")
    if not isinstance(name, str) or not name.strip():
        errors["name"] = "required"
    elif len(name.strip()) > MAX_NAME_LENGTH:
        errors["name"] = "too long"
    email = data.get("email")
    if not isinstance(email, str) or not EMAIL_PATTERN.match(email.strip()):
        errors["email"] = "invalid"
    return errors

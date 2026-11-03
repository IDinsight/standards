EDITABLE_FIELDS = ("full_name", "email", "phone")


def _text(changes, name):
    value = changes[name]
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string")
    return value.strip()


class ProfileService:
    def __init__(self, repository):
        self.repository = repository

    def get_profile(self, customer_id):
        return self.repository.get(customer_id)

    def update_profile(self, customer_id, changes):
        unknown = sorted(set(changes) - set(EDITABLE_FIELDS))
        if unknown:
            raise ValueError("unknown fields: " + ", ".join(unknown))
        if self.repository.get(customer_id) is None:
            return None
        fields = {}
        if "full_name" in changes:
            full_name = _text(changes, "full_name")
            if not full_name:
                raise ValueError("full_name must not be empty")
            fields["full_name"] = full_name
        if "email" in changes:
            email = (_text(changes, "email") or "").lower()
            if "@" not in email:
                raise ValueError("email is not valid")
            fields["email"] = email
        if "phone" in changes:
            fields["phone"] = _text(changes, "phone") or None
        return self.repository.update(customer_id, fields)

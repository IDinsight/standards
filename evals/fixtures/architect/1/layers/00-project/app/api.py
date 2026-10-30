def _profile_body(customer):
    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
    }


def get_profile(service, customer_id):
    customer = service.get_profile(customer_id)
    if customer is None:
        return 404, {"error": "not found"}
    return 200, _profile_body(customer)


def patch_profile(service, customer_id, body):
    if not isinstance(body, dict):
        return 400, {"error": "body must be an object"}
    try:
        customer = service.update_profile(customer_id, body)
    except ValueError as exc:
        return 400, {"error": str(exc)}
    if customer is None:
        return 404, {"error": "not found"}
    return 200, _profile_body(customer)

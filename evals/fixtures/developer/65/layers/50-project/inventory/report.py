def build_summary(items):
    """Summarize stock levels for a list of items."""
    return {
        "total_items": len(items),
        "total_units": sum(item.quantity for item in items),
        "low_stock": [item.sku for item in items if item.is_low],
    }


def format_text(summary):
    """Render a summary as the three-line report shown to people."""
    low = ", ".join(summary["low_stock"]) or "none"
    return "\n".join(
        [
            f"Items: {summary['total_items']}",
            f"Units: {summary['total_units']}",
            f"Low stock: {low}",
        ]
    )

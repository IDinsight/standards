def stock_summary(store):
    items = store.items()
    return {"skus": len(items), "units": sum(item.quantity for item in items)}

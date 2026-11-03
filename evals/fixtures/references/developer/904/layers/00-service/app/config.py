import os

DATABASE_URL = os.environ.get("BILLING_DATABASE_URL", "sqlite:///./billing.db")

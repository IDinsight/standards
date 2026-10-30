from app.models import Customer

COLUMNS = "id, full_name, email, phone, created_at"


class CustomerRepository:
    def __init__(self, conn):
        self.conn = conn

    def add(self, full_name, email, created_at, phone=None):
        cursor = self.conn.execute(
            "INSERT INTO customers (full_name, email, phone, created_at) VALUES (?, ?, ?, ?)",
            (full_name, email, phone, created_at),
        )
        self.conn.commit()
        return self.get(cursor.lastrowid)

    def get(self, customer_id):
        row = self.conn.execute(
            f"SELECT {COLUMNS} FROM customers WHERE id = ?", (customer_id,)
        ).fetchone()
        if row is None:
            return None
        return Customer(**{key: row[key] for key in row.keys()})

    def update(self, customer_id, fields):
        if fields:
            assignments = ", ".join(f"{name} = ?" for name in fields)
            self.conn.execute(
                f"UPDATE customers SET {assignments} WHERE id = ?",
                (*fields.values(), customer_id),
            )
            self.conn.commit()
        return self.get(customer_id)

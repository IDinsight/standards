import sqlite3

from app.models import Task

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
)
"""


class TaskStore:
    def __init__(self, path=":memory:"):
        self.db = sqlite3.connect(path)
        self.db.execute(SCHEMA)
        self.db.commit()

    def add(self, title):
        cursor = self.db.execute("INSERT INTO tasks (title) VALUES (?)", (title,))
        self.db.commit()
        return Task(cursor.lastrowid, title, False)

    def get(self, task_id):
        row = self.db.execute(
            "SELECT id, title, done FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()
        return _task(row) if row else None

    def list(self):
        rows = self.db.execute("SELECT id, title, done FROM tasks ORDER BY id").fetchall()
        return [_task(row) for row in rows]

    def set_done(self, task_id, done):
        self.db.execute("UPDATE tasks SET done = ? WHERE id = ?", (int(done), task_id))
        self.db.commit()

    def close(self):
        self.db.close()


def _task(row):
    return Task(row[0], row[1], bool(row[2]))

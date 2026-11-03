import os
import sqlite3

DEFAULT_PATH = os.environ.get("RECORDS_DB", "data/records.db")


def get_connection(path=None):
    return sqlite3.connect(path or DEFAULT_PATH)

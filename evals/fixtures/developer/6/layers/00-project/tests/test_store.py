import sqlite3

from app.models import Account
from app.store import MIGRATIONS, AccountStore


def test_new_store_applies_all_migrations():
    store = AccountStore()
    assert store.db.execute("PRAGMA user_version").fetchone()[0] == len(MIGRATIONS)


def test_save_and_get_round_trip():
    store = AccountStore()
    store.save(Account(1, "Ada Lovelace", "ada@example.org", phone="555-0100"))
    assert store.get(1) == Account(1, "Ada Lovelace", "ada@example.org", "active", "555-0100", None)


def test_list_orders_by_id():
    store = AccountStore()
    store.save(Account(2, "Grace Hopper", "grace@example.org"))
    store.save(Account(1, "Ada Lovelace", "ada@example.org"))
    assert [account.id for account in store.list()] == [1, 2]


def test_existing_database_is_upgraded(tmp_path):
    path = tmp_path / "accounts.db"
    db = sqlite3.connect(path)
    db.execute(MIGRATIONS[0])
    db.execute("INSERT INTO accounts (id, name, email) VALUES (3, 'Alan Turing', 'alan@example.org')")
    db.execute("PRAGMA user_version = 1")
    db.commit()
    db.close()
    store = AccountStore(path)
    assert store.get(3) == Account(3, "Alan Turing", "alan@example.org")

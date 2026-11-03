from app.services.counter_store import InMemoryCounterStore


class FakeClock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now


def test_new_key_starts_at_one_without_expiry():
    store = InMemoryCounterStore(clock=FakeClock())
    assert store.get("k") == 0
    assert store.ttl("k") == -2
    assert store.incr("k") == 1
    assert store.incr("k") == 2
    assert store.ttl("k") == -1


def test_key_expires_at_deadline():
    clock = FakeClock()
    store = InMemoryCounterStore(clock=clock)
    store.incr("k")
    store.expire("k", 60)
    clock.now += 59
    assert store.get("k") == 1
    assert store.ttl("k") == 1
    clock.now += 1
    assert store.get("k") == 0
    assert store.ttl("k") == -2


def test_incr_keeps_existing_expiry():
    clock = FakeClock()
    store = InMemoryCounterStore(clock=clock)
    store.incr("k")
    store.expire("k", 30)
    clock.now += 10
    assert store.incr("k") == 2
    assert store.ttl("k") == 20


def test_expire_on_missing_key_does_nothing():
    store = InMemoryCounterStore(clock=FakeClock())
    store.expire("k", 30)
    assert store.ttl("k") == -2


def test_delete_removes_counter():
    store = InMemoryCounterStore(clock=FakeClock())
    store.incr("k")
    store.expire("k", 30)
    store.delete("k")
    assert store.get("k") == 0
    assert store.ttl("k") == -2

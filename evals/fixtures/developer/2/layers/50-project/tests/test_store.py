from app.store import TaskStore


def test_add_and_list():
    store = TaskStore()
    store.add("Buy milk")
    store.add("Call Sam")
    assert [task.title for task in store.list()] == ["Buy milk", "Call Sam"]


def test_get_returns_none_for_missing_task():
    assert TaskStore().get(42) is None


def test_set_done_persists(tmp_path):
    path = tmp_path / "tasks.db"
    store = TaskStore(str(path))
    task = store.add("Buy milk")
    store.set_done(task.id, True)
    store.close()
    assert TaskStore(str(path)).get(task.id).done is True

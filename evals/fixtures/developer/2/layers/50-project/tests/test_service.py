import pytest

from app.service import TaskService
from app.store import TaskStore


def make_service():
    return TaskService(TaskStore())


def test_create_task_strips_title():
    task = make_service().create_task("  Buy milk  ")
    assert task.title == "Buy milk"


@pytest.mark.parametrize("title", ["", "   ", None])
def test_create_task_requires_title(title):
    service = make_service()
    with pytest.raises(ValueError):
        service.create_task(title)
    assert service.list_tasks() == []


def test_create_task_rejects_long_title():
    with pytest.raises(ValueError):
        make_service().create_task("x" * 201)


def test_complete_task_marks_done():
    service = make_service()
    task = service.create_task("Buy milk")
    assert service.complete_task(task.id).done is True
    assert service.list_tasks()[0].done is True

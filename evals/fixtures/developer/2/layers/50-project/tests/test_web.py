from app.service import TaskService
from app.store import TaskStore
from app.web import handle_complete, handle_create, handle_list


def test_create_redirects_to_list():
    service = TaskService(TaskStore())
    assert handle_create(service, {"title": "Buy milk"}) == (303, "/tasks")
    status, html = handle_list(service)
    assert status == 200 and "Buy milk" in html


def test_create_with_blank_title_is_rejected():
    service = TaskService(TaskStore())
    status, html = handle_create(service, {"title": " "})
    assert status == 400
    assert "title is required" in html
    assert service.list_tasks() == []


def test_complete_unknown_task_is_not_found():
    status, _ = handle_complete(TaskService(TaskStore()), 99)
    assert status == 404

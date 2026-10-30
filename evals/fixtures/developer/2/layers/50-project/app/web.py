from app.views import render_task_list


def handle_list(service):
    return 200, render_task_list(service.list_tasks())


def handle_create(service, form):
    try:
        service.create_task(form.get("title"))
    except ValueError as exc:
        return 400, render_task_list(service.list_tasks(), error=str(exc))
    return 303, "/tasks"


def handle_complete(service, task_id):
    try:
        service.complete_task(task_id)
    except LookupError:
        return 404, render_task_list(service.list_tasks(), error="Task not found.")
    return 303, "/tasks"

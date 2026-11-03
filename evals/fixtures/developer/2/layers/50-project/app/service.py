MAX_TITLE_LENGTH = 200


class TaskService:
    def __init__(self, store):
        self.store = store

    def create_task(self, title):
        title = (title or "").strip()
        if not title:
            raise ValueError("title is required")
        if len(title) > MAX_TITLE_LENGTH:
            raise ValueError(f"title must be at most {MAX_TITLE_LENGTH} characters")
        return self.store.add(title)

    def list_tasks(self):
        return self.store.list()

    def complete_task(self, task_id):
        task = self.store.get(task_id)
        if task is None:
            raise LookupError(f"task {task_id} not found")
        self.store.set_done(task_id, True)
        task.done = True
        return task

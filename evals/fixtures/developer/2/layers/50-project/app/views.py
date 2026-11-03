from html import escape


def render_task_list(tasks, error=None):
    parts = ["<h1>Tasks</h1>"]
    if error:
        parts.append(f'<p class="error">{escape(error)}</p>')
    if tasks:
        items = "\n".join(_task_item(task) for task in tasks)
        parts.append(f'<ul class="tasks">\n{items}\n</ul>')
    else:
        parts.append('<p class="empty">No tasks yet.</p>')
    parts.append(render_new_task_form())
    return "\n".join(parts)


def render_new_task_form():
    return "\n".join(
        [
            '<form method="post" action="/tasks">',
            '  <label for="title">Title</label>',
            '  <input id="title" name="title" type="text" maxlength="200" required>',
            '  <button type="submit">Add task</button>',
            "</form>",
        ]
    )


def _task_item(task):
    state = "done" if task.done else "open"
    return f'  <li class="task task-{state}" data-id="{task.id}">{escape(task.title)}</li>'

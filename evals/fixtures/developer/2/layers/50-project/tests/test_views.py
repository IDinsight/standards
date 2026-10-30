from app.models import Task
from app.views import render_task_list


def test_lists_tasks_with_escaped_titles():
    html = render_task_list([Task(1, "Fix <b>sink</b>"), Task(2, "Call Sam", True)])
    assert "Fix &lt;b&gt;sink&lt;/b&gt;" in html
    assert 'class="task task-done" data-id="2"' in html


def test_empty_list_message():
    assert "No tasks yet." in render_task_list([])


def test_form_posts_to_tasks():
    html = render_task_list([])
    assert '<form method="post" action="/tasks">' in html
    assert 'name="title"' in html

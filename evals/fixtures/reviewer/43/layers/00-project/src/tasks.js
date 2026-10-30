export function listTasks(store) {
  return { status: 200, body: { tasks: store.all() } };
}

export function getTask(store, id) {
  const task = store.get(Number(id));
  if (!task) return { status: 404, body: { error: 'not found' } };
  return { status: 200, body: task };
}

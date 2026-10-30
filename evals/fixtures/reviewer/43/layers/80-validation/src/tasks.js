import { QueryError, parseListQuery } from './query.js';

function matches(task, filters) {
  if (filters.status !== undefined && task.status !== filters.status) return false;
  if (filters.assignee !== undefined && task.assignee !== filters.assignee) return false;
  if (filters.due_from !== undefined && (task.due === null || task.due < filters.due_from)) return false;
  if (filters.due_to !== undefined && (task.due === null || task.due > filters.due_to)) return false;
  return true;
}

export function listTasks(store, query = {}) {
  let filters;
  try {
    filters = parseListQuery(query);
  } catch (error) {
    if (error instanceof QueryError) {
      return { status: 400, body: { error: error.message, parameter: error.parameter } };
    }
    throw error;
  }
  return { status: 200, body: { tasks: store.all().filter((task) => matches(task, filters)) } };
}

export function getTask(store, id) {
  const task = store.get(Number(id));
  if (!task) return { status: 404, body: { error: 'not found' } };
  return { status: 200, body: task };
}
